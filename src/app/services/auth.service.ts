import { Injectable, EventEmitter, Output } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Router } from '@angular/router';


import { ConfigService } from './config.service';
import { PouchService } from './pouch.service';

declare var PouchDB: any;
declare var localStorage: any;
declare var window: any;
declare var ipcRenderer: any;

@Injectable()
export class AuthService {
  router
  logged_in;
  db;
  sessiondata; // used to store couch user object 
  pouchService;
  // Observable navItem source
  private _loginStateSource = new BehaviorSubject<boolean>(false);
  // Observable navItem stream
  navItem$ = this._loginStateSource.asObservable();

  changeLoginState = new EventEmitter<boolean>();

  ConfigService: ConfigService
  remote: string

  constructor(PouchService: PouchService, ConfigService: ConfigService, Router: Router) {

    this.router = Router;

    this.pouchService = PouchService;

    console.log('initializing login...');

    //this.db = PouchService.initDB('mydb', {skipSetup:true});
    this.remote = ConfigService.getConfiguration('db_remote_url');

    this.db = new PouchDB(this.remote + '_users/', { skipSetup: true });


    var self = this;
    self.changeLoginStateTo(false);

    this.db.getSession(function(err, response) {

      console.log('...getting session:')
      if (err) {
        // network error
      } else if (!response.userCtx.name) {
        console.log('...no existing session');
        self.changeLoginStateTo(false);
      } else {
        //store returned sessiondata
        if (response.ok)
          self.sessiondata = response.userCtx

        self.changeLoginStateTo(true);
      }
    });
  }



  changeLoginStateTo(loginState) {

    this.changeLoginState.emit(loginState)

  }

  //@param userdata {username:string, password:string}
  login(userdata) {

    var self = this;
    this.db.login(userdata.username, userdata.password, function(err, response) {
      if (err) {
        console.log(err)
        if (err.name === 'unauthorized' || err.name === 'authentication_error') {
          alert('...password or username wrong');
        } else {

        }
      } else {

        if (response.ok)
          self.sessiondata = response;

        self.pouchService.reinitializeDBs();

        localStorage.username = userdata.username;
        localStorage.password = userdata.password;
        self.changeLoginStateTo(true);

        /*rerender after short timeout (we would need a waterfall cb inside the pouchservice.reinitializeDBs, to have a more elegant solution)*/
        setTimeout(function() {
          window.location = window.location.href + 'index.html';
        }, 1500)

        console.log('...log in successful');
      }
    });
  }
  logout() {

    this.changeLoginStateTo(false);
    ipcRenderer.send('logout-called');

  }
  is_logged_in() {
    return this.logged_in
  }
  getUserData() {
    return this.sessiondata;
  }

}
