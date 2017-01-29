import {Injectable,EventEmitter,Output}     from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

declare var PouchDB: any;
declare var localStorage: any;
@Injectable()
export class AuthService {
  logged_in;
  db;  

  // Observable navItem source
  private _loginStateSource = new BehaviorSubject<boolean>(false);
  // Observable navItem stream
  navItem$ = this._loginStateSource.asObservable();

  changeLoginState = new EventEmitter<boolean>();


  changeLoginStateTo(loginState) {
    this.changeLoginState.emit(loginState)
  }

  constructor() {

    console.log('initializing login...');

    this.db = new PouchDB('http://localhost:5984/mydb', {skipSetup: true});


    var self = this;
  	self.changeLoginStateTo(false);


    this.db.getSession(function (err, response) {
      if (err) {
        // network error
      } else if (!response.userCtx.name) {
        console.log('...no existing session');
        self.changeLoginStateTo(false);
      } else {
        console.log('...session existing:');
        console.log(response);
        self.changeLoginStateTo(true);
      }
    });
  }

  //@param userdata {username:string, password:string}
  login(userdata){
    var self = this;
    this.db.login(userdata.username, userdata.password, function (err, response) {
      if (err) {
        console.log(err)
        if (err.name === 'unauthorized') {
          console.log('...password or username wrong');
        } else {
          // cosmic rays, a meteor, etc.
        }
      }else{
        localStorage.username = userdata.username;
        localStorage.password = userdata.password;
        self.changeLoginStateTo(true);
        console.log('...log in successful');
      }
    });
  }
  is_logged_in() {
  	return this.logged_in;
  }

}
