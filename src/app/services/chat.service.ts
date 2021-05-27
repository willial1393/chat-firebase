import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {Chat} from '../models/chat.model';
import {Message} from '../models/message.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly collection = 'chats';

  constructor(private fire: AngularFirestore) {
  }

  getAll(email: string): Observable<Chat[]> {
    // const chatFrom: Observable<Chat[]> = this.fire.collection<Chat>(this.collection, ref => ref
    //   .where('from', '==', email)
    // ).valueChanges();
    //
    // const chatTo: Observable<Chat[]> = this.fire.collection<Chat>(this.collection, ref => ref
    //   .where('to', '==', email)
    // ).valueChanges();
    //
    // return merge(chatFrom, chatTo).pipe(
    //   map(value => value.sort((a, b) => {
    //     return a.updatedAt.localeCompare(b.updatedAt);
    //   }))
    // );
    return this.fire.collection<Chat>(this.collection).valueChanges();
  }

  get(id: string): Observable<Chat | undefined> {
    return this.fire.collection<Chat>(this.collection).doc(id).valueChanges();
  }

  getMessage(chatId: string, limit: number): Observable<Message[]> {
    return this.fire.collection<Message>(`${this.collection}/${chatId}/messages`, ref => ref
      .orderBy('createdAt', 'desc')
      .limit(limit)
    ).valueChanges();
  }

  async getMessageOld(chatId: string, index: Message): Promise<Message[]> {
    const res = await this.fire.collection<Message>(`${this.collection}/${chatId}/messages`, ref => ref
      .where('createdAt', '==', index.createdAt)
      .limit(1)
    ).get().toPromise();

    console.log(res.docs.map(value => value.data()));
    return this.fire.collection<Message>(`${this.collection}/${chatId}/messages`, ref => ref
      .orderBy('createdAt', 'desc')
      .startAfter(res.docs.pop())
      .limit(2)
    ).valueChanges().toPromise();
  }

  async create(chat: Chat): Promise<void> {
    if (!chat.id) {
      throw Error('id is null');
    }
    await this.fire.collection(this.collection)
      .doc(chat.id).set({...chat});
  }

  async sendMessage(chatId: string, message: Message): Promise<void> {
    await this.fire.collection(`${this.collection}/${chatId}/messages`)
      .add({...message});
  }
}
