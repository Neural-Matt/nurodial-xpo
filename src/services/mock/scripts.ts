export const callScripts: Record<string, string> = {
  RETAIN25: 'Hi {firstName}, this is {agent} from NuroDial calling about your account. We noticed you may be considering cancelling — I\'d like to see if there\'s anything we can do to keep your service working for you today.',
  OUTSALES: 'Hi {firstName}, this is {agent} from NuroDial. I\'m reaching out because you may qualify for a limited-time offer on our latest plans — do you have a couple of minutes?',
  WINBACK: 'Hi {firstName}, this is {agent} from NuroDial. It\'s been a while since we\'ve heard from you, and we\'d love to have you back — can I tell you about what\'s new?',
  APPTREM: 'Hi {firstName}, this is {agent} from NuroDial calling to confirm your upcoming appointment. Is the scheduled time still good for you?',
  SURVEY25: 'Hi {firstName}, this is {agent} from NuroDial. We\'d appreciate two minutes of your time for a quick follow-up survey about your recent service.',
  INOVRFLW: 'Thank you for calling NuroDial Support, this is {agent}. How can I help you today?',
};

export const defaultCallScript = 'Hi, this is {agent} from NuroDial. How can I help you today?';
