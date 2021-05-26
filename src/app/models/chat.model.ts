import * as moment from 'moment';

export class Chat {
  id: string | null = null;
  from: string | null = null;
  to: string | null = null;
  type: string | null = null;
  negotiation: string | null = null;
  createdAt: string = moment().toISOString(true);
  updatedAt: string = moment().toISOString(true);
}
