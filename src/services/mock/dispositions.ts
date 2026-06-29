import type { Disposition } from '../../types/vicidial';

export const dispositions: Disposition[] = [
  { statusCode: 'SALE', label: 'Sale', category: 'Sale', requiresCallback: false, requiresNotes: true, isSale: true, isDnc: false, isFinal: true },
  { statusCode: 'CALLBK', label: 'Callback', category: 'Contact', requiresCallback: true, requiresNotes: true, isSale: false, isDnc: false, isFinal: false },
  { statusCode: 'NI', label: 'Not Interested', category: 'Contact', requiresCallback: false, requiresNotes: false, isSale: false, isDnc: false, isFinal: true },
  { statusCode: 'DNC', label: 'Do Not Call', category: 'Compliance', requiresCallback: false, requiresNotes: true, isSale: false, isDnc: true, isFinal: true },
  { statusCode: 'AM', label: 'Answering Machine', category: 'No Contact', requiresCallback: true, requiresNotes: false, isSale: false, isDnc: false, isFinal: false },
  { statusCode: 'NA', label: 'No Answer', category: 'No Contact', requiresCallback: true, requiresNotes: false, isSale: false, isDnc: false, isFinal: false },
  { statusCode: 'B', label: 'Busy', category: 'No Contact', requiresCallback: true, requiresNotes: false, isSale: false, isDnc: false, isFinal: false },
  { statusCode: 'DC', label: 'Disconnected Number', category: 'No Contact', requiresCallback: false, requiresNotes: false, isSale: false, isDnc: false, isFinal: true },
  { statusCode: 'XFER', label: 'Transferred', category: 'Contact', requiresCallback: false, requiresNotes: true, isSale: false, isDnc: false, isFinal: true },
  { statusCode: 'N', label: 'No - Not Interested', category: 'Contact', requiresCallback: false, requiresNotes: false, isSale: false, isDnc: false, isFinal: true },
];
