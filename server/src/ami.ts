import net from 'net';
import { EventEmitter } from 'events';
import { writeQuery } from './writeDb.js';

// Minimal purpose-built Asterisk Manager Interface (AMI) client -- plain-text
// key:value protocol over TCP, terminated by a blank line (\r\n\r\n) per
// packet. No third-party AMI library is used; the protocol is simple enough
// that a small, purpose-built client is easier to reason about and keep
// dependency-free than wrapping an unmaintained npm package.
const AMI_HOST = process.env.AMI_HOST ?? '127.0.0.1';
const AMI_PORT = Number(process.env.AMI_PORT ?? 5038);
const AMI_USERNAME = process.env.AMI_USERNAME ?? 'cron';
const AMI_SECRET = process.env.AMI_SECRET ?? '1234';

export type AmiPacket = Record<string, string>;

class AmiClient extends EventEmitter {
  private socket: net.Socket | null = null;
  private buffer = '';
  private pending = new Map<string, { resolve: (p: AmiPacket) => void; reject: (e: Error) => void }>();
  private actionCounter = 0;
  private loggedIn = false;
  private connectPromise: Promise<void> | null = null;

  connect(): Promise<void> {
    if (this.connectPromise) return this.connectPromise;
    this.connectPromise = new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: AMI_HOST, port: AMI_PORT });
      this.socket = socket;
      socket.setEncoding('utf8');

      socket.on('data', (chunk: string) => this.handleData(chunk));
      socket.on('error', (err) => {
        this.loggedIn = false;
        this.connectPromise = null;
        reject(err);
        this.emit('error', err);
      });
      socket.on('close', () => {
        this.loggedIn = false;
        this.connectPromise = null;
        this.socket = null;
        // Reconnect in the background; callers that need a live connection
        // should await ensureConnected() before each action.
        setTimeout(() => { this.connect().catch(() => {}); }, 3000);
      });

      socket.once('connect', async () => {
        try {
          const resp = await this.sendAction({ Action: 'Login', Username: AMI_USERNAME, Secret: AMI_SECRET });
          if (resp.Response !== 'Success') {
            throw new Error(`AMI login failed: ${resp.Message ?? 'unknown error'}`);
          }
          this.loggedIn = true;
          resolve();
        } catch (err) {
          reject(err as Error);
        }
      });
    });
    return this.connectPromise;
  }

  async ensureConnected(): Promise<void> {
    if (this.loggedIn) return;
    await this.connect();
  }

  private handleData(chunk: string) {
    this.buffer += chunk;
    let idx: number;
    while ((idx = this.buffer.indexOf('\r\n\r\n')) !== -1) {
      const raw = this.buffer.slice(0, idx);
      this.buffer = this.buffer.slice(idx + 4);
      this.handlePacket(raw);
    }
  }

  private handlePacket(raw: string) {
    const packet: AmiPacket = {};
    for (const line of raw.split('\r\n')) {
      const sep = line.indexOf(':');
      if (sep === -1) continue;
      packet[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
    }
    if (!Object.keys(packet).length) return;

    if (packet.ActionID && this.pending.has(packet.ActionID)) {
      const p = this.pending.get(packet.ActionID)!;
      this.pending.delete(packet.ActionID);
      p.resolve(packet);
    }
    if (packet.Event) {
      this.emit('event', packet);
      this.emit(packet.Event, packet);
    }
  }

  /** Sends an action and resolves with the first packet sharing its ActionID
   *  (the immediate Response ack -- for actions like Originate that later
   *  raise a separate correlated Event, use waitForEvent() for the outcome). */
  sendAction(fields: AmiPacket): Promise<AmiPacket> {
    if (!this.socket) return Promise.reject(new Error('AMI not connected.'));
    const actionId = fields.ActionID ?? `nurodial-${Date.now()}-${this.actionCounter++}`;
    const withId = { ...fields, ActionID: actionId };
    const payload = `${Object.entries(withId).map(([k, v]) => `${k}: ${v}`).join('\r\n')}\r\n\r\n`;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(actionId);
        reject(new Error(`AMI action timed out: ${fields.Action}`));
      }, 10000);
      this.pending.set(actionId, {
        resolve: (p) => { clearTimeout(timeout); resolve(p); },
        reject: (e) => { clearTimeout(timeout); reject(e); },
      });
      this.socket!.write(payload);
    });
  }

  /** Waits for a later Event (e.g. OriginateResponse) matching a predicate --
   *  used to learn the real outcome/channel name of an async Originate. */
  waitForEvent(eventName: string, predicate: (p: AmiPacket) => boolean, timeoutMs = 30000): Promise<AmiPacket> {
    return new Promise((resolve, reject) => {
      const handler = (packet: AmiPacket) => {
        if (predicate(packet)) {
          clearTimeout(timer);
          this.off(eventName, handler);
          resolve(packet);
        }
      };
      const timer = setTimeout(() => {
        this.off(eventName, handler);
        reject(new Error(`Timed out waiting for ${eventName}`));
      }, timeoutMs);
      this.on(eventName, handler);
    });
  }
}

export const ami = new AmiClient();

// Call once at server startup. Connects (in the background if the first
// attempt fails -- the client's own close-handler retries automatically) and
// registers a global Hangup listener so an agent's tracked channel gets
// cleared the moment Asterisk actually ends the call, even if the agent
// never clicks "End Call"/"Save Disposition" themselves (e.g. the far end
// hangs up first). Deliberately only clears `channel`, not `status` --
// leaving status alone preserves the existing wrap-up/disposition flow
// (the frontend only clears its call screen once status itself changes),
// while still preventing a later Hangup action from erroring against a
// channel that's already gone.
export async function initAmi(): Promise<void> {
  ami.on('Hangup', (event: AmiPacket) => {
    if (!event.Channel) return;
    writeQuery("UPDATE vicidial_live_agents SET channel = '' WHERE channel = ?", [event.Channel]).catch(() => {});
  });
  try {
    await ami.connect();
    console.log('AMI connected.');
  } catch (err) {
    console.error('AMI initial connection failed; will keep retrying in the background:', err);
  }
}
