import {Injectable} from '@angular/core';
import {AngularFireAuth} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: AngularFireAuth) {
  }

  login(email: string, password: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.auth.signInWithEmailAndPassword(email, password).then(() => {
        resolve();
      }).catch(reason => {
        switch (reason.code) {
          case 'auth/invalid-email':
          case 'auth/user-disabled':
          case 'auth/wrong-password':
            reject(reason);
            break;
          case 'auth/user-not-found':
            this.auth.createUserWithEmailAndPassword(email, password)
              .then(() => resolve())
              .catch(reason1 => {
                switch (reason1) {
                  case  'auth/email-already-in-use':
                  case  'auth/invalid-email':
                  case  'auth/operation-not-allowed':
                  case  'auth/weak-password':
                    break;
                }
                reject(reason1);
              })
            break;
          default:
            reject(reason);
        }
      })
    });
  }
}
