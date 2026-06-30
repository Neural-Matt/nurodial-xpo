// Shapes actually derivable from VICIDial's database, as opposed to the
// richer mock-driven types in the frontend's src/types/vicidial.ts. Some
// frontend Campaign fields (description, assignedAgents, a true "Blended"
// type) have no direct VICIDial column and are NOT fabricated here — see
// server/README.md "Known gaps" before wiring the frontend to this API.

export interface ApiCampaign {
  campaignId: string;
  campaignName: string;
  active: boolean;
  dialMethod: string;
  autoDialLevel: number;
  hopperLevel: number;
  localCallTime: string;
  type: 'Inbound' | 'Outbound'; // best-effort derivation from dial_method; "Blended" isn't derivable from this table alone
  status: 'Active' | 'Paused'; // derived from active Y/N; VICIDial has no native "Closed" campaign state
}

export interface ApiLead {
  leadId: string;
  listId: string;
  campaignId: string;
  phoneNumber: string;
  phoneCode: string;
  firstName: string;
  lastName: string;
  email: string;
  province: string; // mapped from vicidial_list.state — verify against real schema
  city: string;
  address: string;
  vendorLeadCode: string;
  sourceId: string;
  status: string;
  calledCount: number;
  lastCallTime: string;
}

export interface ApiDisposition {
  statusCode: string;
  label: string;
  selectable: boolean;
  humanAnswered: boolean;
  sale: boolean;
  dnc: boolean;
}
