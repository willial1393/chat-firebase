import * as moment from 'moment';

export class Message {
  text: string | null = null;
  userSend: string | null = null;
  viewed: boolean = false;
  createdAt: string = moment().toISOString(true);
}
