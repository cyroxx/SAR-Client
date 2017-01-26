import {Injectable,EventEmitter}     from '@angular/core';
declare var PouchDB: any;
declare var localStorage: any;
@Injectable()
export class AuthService {
  logged_in;
  db;  
  constructor() {

    this.db = new PouchDB('http://localhost:5984/mydb', {skipSetup: true});
    var self = this;
  	this.logged_in = false;
    this.db.getSession(function (err, response) {
      if (err) {
        // network error
      } else if (!response.userCtx.name) {
        self.logged_in = false;
      } else {
        console.log('session existing:');
        console.log(response);
        self.logged_in = true;
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
          alert('password or username wrong');
        } else {
          // cosmic rays, a meteor, etc.
        }
      }else{
        localStorage.username = userdata.username;
        localStorage.password = userdata.password;
        self.logged_in = true;
        alert('log in successful');
      }
    });
  }
  is_logged_in() {
  	return this.logged_in;
  }

}
