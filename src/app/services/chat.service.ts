import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {merge, Observable} from 'rxjs';
import {Chat} from '../models/chat.model';
import {Message} from '../models/message.model';
import {map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private readonly collection = 'chats';

  constructor(private fire: AngularFirestore) {
  }

  getAll(email: string): Observable<Chat[]> {
    const chatFrom: Observable<Chat[]> = this.fire.collection<Chat>(this.collection, ref => ref
      .where('from', '==', email)
    ).valueChanges();

    const chatTo: Observable<Chat[]> = this.fire.collection<Chat>(this.collection, ref => ref
      .where('to', '==', email)
    ).valueChanges();

    return merge(chatFrom, chatTo).pipe(
      map(value => value.sort((a, b) => {
        return a.updatedAt.localeCompare(b.updatedAt);
      }))
    );
  }

  get(id: string): Observable<Chat | undefined> {
    return this.fire.collection<Chat>(this.collection).doc(id).valueChanges();
  }

  getMessage(chatId: string): Observable<Message[]> {
    return this.fire.collection<Message>(`${this.collection}/${chatId}/messages`)
      .valueChanges();
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
