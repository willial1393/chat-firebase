import {Component, OnDestroy, OnInit} from '@angular/core';
import * as moment from 'moment';
import {Chat} from './models/chat.model';
import {ChatService} from './services/chat.service';
import {ToastrService} from 'ngx-toastr';
import {Observable, Subscription} from 'rxjs';
import {Message} from './models/message.model';
import {AuthService} from './services/auth.service';
import {AngularFireAuth} from '@angular/fire/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy, OnInit {

  $chats: Observable<Chat[] | undefined> | undefined;
  messages: Message[] = [];
  text: string | undefined;
  index: Message | undefined;
  chatId: string | undefined | null;
  private subsChat: Subscription | undefined;
  email: string | undefined;
  private subsAuth: Subscription | undefined;

  constructor(private chatService: ChatService,
              private toast: ToastrService,
              private authService: AuthService,
              private auth: AngularFireAuth) {

  }

  ngOnInit(): void {
    this.subsAuth = this.auth.authState.subscribe(value => {
      console.log(value?.email);
      if (value) {
        this.$chats = this.chatService.getAll('willial1393@gmail.com');
      }
    })
  }

  ngOnDestroy(): void {
    this.subsChat?.unsubscribe();
    this.subsAuth?.unsubscribe();
  }

  async createChat() {
    try {
      this.chatId = Date.now().toString();

      await this.chatService.create({
        createdAt: moment().toISOString(true),
        from: 'willial1393@gmail.com',
        updatedAt: moment().toISOString(true),
        id: this.chatId,
        to: 'nano@gmail.com',
        type: null,
        negotiation: this.chatId
      });

      this.getChat();

      this.toast.success('Creado');
    } catch (e) {
      this.toast.error(e.message);
    }
  }

  sendMessage() {

    if (!this.text) {
      this.toast.error('Escribe un mensaje');
      return;
    }

    if (!this.chatId) {
      this.toast.error('Chat id is null');
      return;
    }

    this.chatService.sendMessage(this.chatId, {
      viewed: false,
      createdAt: moment().toISOString(true),
      text: this.text,
      userSend: 'willial1393@gmail.com'
    })
      .then(() => {
        this.text = '';
      })
      .catch(reason => this.toast.error(reason.message));
  }

  viewMore() {
    console.log('viewMore')
    if (!this.chatId) {
      this.toast.error('Chat no existe');
      return;
    }
    if (!this.index) {
      this.toast.error('Index no existe');
      return;
    }

    this.chatService.getMessageOld(this.chatId, this.index).then(value => {
      console.log('getMessageOld', value);
      this.messages = value.concat(this.messages);
      this.index = value[value.length - 1];
      console.log(this.index);
    }).catch(reason => this.toast.error(reason.message));

  }

  selectChat(chat: Chat) {
    this.subsChat?.unsubscribe();
    this.chatId = chat.id;
    this.getChat();
  }

  getChat() {
    if (!this.chatId) {
      this.toast.error('Chat no existe');
      return;
    }

    this.subsChat = this.chatService.getMessage(this.chatId, 3).subscribe(value => {
      if (value.length > 2 && !this.index) {
        this.index = value.pop();
      }
      if (value[0]) {
        this.messages = this.messages.filter(value1 => value1.createdAt !== value[0].createdAt);
        this.messages.push(value[0]);
      }
    });
  }

  login() {
    if (this.email) {
      this.authService.login(this.email, 'admin123').then(() => console.log('ok'));
    }
  }

  logout() {
    this.auth.signOut().then();
  }
}
