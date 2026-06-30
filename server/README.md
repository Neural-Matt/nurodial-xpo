# NuroDial Server

A thin, **read-only** backend that bridges NuroDial to a real VICIDial install — queries VICIDial's MySQL database directly and exposes it as a small REST API. No writes, no AMI, no call control yet (see "Explicitly deferred" below).

## 1. Verify the schema before trusting the queries

The queries in `src/routes/*.ts` are written from documented VICIDial schema, not verified against this specific install. Before relying on the output, SSH into the Proxmox box and run:

```sql
DESCRIBE vicidial_campaigns;
DESCRIBE vicidial_list;
DESCRIBE vicidial_statuses;
```

Compare against the column names referenced in each route file (each has a comment pointing at the relevant `DESCRIBE`). If anything doesn't match — likely candidates are `vicidial_list`'s `state`/`province` split and whatever your VICIDial version calls the dial-level column — adjust the `SELECT` and the row-mapping interface in that route file. A wrong column name fails loudly (the query errors) — it can't silently corrupt or affect anything, since this account should only ever have `SELECT` privileges.

## 2. Create a read-only MySQL user

Don't point this at an existing admin DB user. On the VICIDial box:

```sql
CREATE USER 'nurodial_readonly'@'%' IDENTIFIED BY 'choose-a-real-password';
GRANT SELECT ON asterisk.* TO 'nurodial_readonly'@'%';
FLUSH PRIVILEGES;
```

(Narrow the `@'%'` host to the new container's actual IP/subnet once you know it, instead of leaving it open to any host.)

## 3. Deploy — pick one

### Option A: Docker (recommended — simplest to update/restart)

On the new Proxmox container/VM (needs Docker installed):

```bash
cd server
cp .env.example .env   # fill in DB_HOST/DB_USER/DB_PASS/CORS_ORIGIN
docker compose up -d --build
```

### Option B: Plain Node + systemd

```bash
cd server
cp .env.example .env   # fill in real values
npm install
npm run build
```

Then a systemd unit (`/etc/systemd/system/nurodial-server.service`):

```ini
[Unit]
Description=NuroDial backend
After=network.target

[Service]
WorkingDirectory=/path/to/server
ExecStart=/usr/bin/node dist/index.js
EnvironmentFile=/path/to/server/.env
Restart=on-failure
User=nurodial

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now nurodial-server
```

## 4. Smoke test

```bash
curl http://<container-ip>:4000/health
curl http://<container-ip>:4000/api/campaigns
curl http://<container-ip>:4000/api/dispositions
curl "http://<container-ip>:4000/api/leads?campaignId=<a real campaign_id>"
```

Confirm real VICIDial data comes back, not an error. If a query errors, it's almost always a column-name mismatch — see step 1.

## Known gaps (frontend's `Campaign` type vs. what VICIDial actually stores)

NuroDial's frontend `Campaign` type (`src/types/vicidial.ts`) has fields with no direct VICIDial column:
- `description` — not stored by VICIDial; this API doesn't fabricate one.
- `type: 'Inbound' | 'Outbound' | 'Blended'` — derived here from `dial_method` only as a best guess (`'Inbound'` vs `'Outbound'`); `'Blended'` isn't derivable without joining `vicidial_inbound_groups`, not attempted yet.
- `assignedAgents` — VICIDial tracks agent campaign access via user groups / `vicidial_users` campaign-access fields, not a simple array on the campaign row; not implemented yet.

The frontend wiring step (connecting `src/services/api/client.ts` to this backend) will need to either accept these gaps, fill them with placeholder values, or this API gets extended once the right VICIDial tables for agent assignment are confirmed.

## Explicitly deferred — not built in this phase

- **Writes via VICIDial's Non-Agent API** (updating lead status/disposition, managing campaigns) — needs the API's source/pass credentials confirmed enabled on this install first.
- **Real-time call control via AMI** (Asterisk Manager Interface) — the highest-risk integration point since it touches live call state. Build and test this against the staging instance specifically, well before anything resembling production use.
- **Auth bridge** — NuroDial's login still uses its own 3 mock accounts (`src/services/mock/accounts.ts`), not real `vicidial_users`. Separate piece of work.
