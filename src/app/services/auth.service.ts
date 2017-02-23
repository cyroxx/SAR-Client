import {Injectable,EventEmitter,Output}     from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {PouchService} from './pouch.service';

declare var PouchDB: any;
declare var localStorage: any;
@Injectable()
export class AuthService {
  logged_in;
  db;
  sessiondata; // used to store couch user object 

  // Observable navItem source
  private _loginStateSource = new BehaviorSubject<boolean>(false);
  // Observable navItem stream
  navItem$ = this._loginStateSource.asObservable();

  changeLoginState = new EventEmitter<boolean>();

  constructor(PouchService:PouchService) {

    console.log('initializing login...');

    //this.db = PouchService.initDB('mydb', {skipSetup:true});

    this.db = new PouchDB('http://localhost:5984/mydb', {skipSetup: true});


    var self = this;
  	self.changeLoginStateTo(false);


    this.db.getSession(function (err, response) {

      console.log('...getting session:')
      if (err) {
        // network error
      } else if (!response.userCtx.name) {
        console.log('...no existing session');
        self.changeLoginStateTo(false);
      } else {
        //store returned sessiondata
        if(response.ok)
          self.sessiondata = response.userCtx

        self.changeLoginStateTo(true);
      }
    });
  }



  changeLoginStateTo(loginState) {
    this.changeLoginState.emit(loginState)
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
        if(response.ok)
          self.sessiondata = response;

        localStorage.username = userdata.username;
        localStorage.password = userdata.password;
        self.changeLoginStateTo(true);

        console.log('...log in successful');
      }
    });
  }
  logout(){
    return this.db.logout()
  }
  is_logged_in() {
  	return this.logged_in
  }
  getUserData() {
    return this.sessiondata;
  }

}
