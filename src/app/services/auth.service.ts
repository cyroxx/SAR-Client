import { Injectable } from '@angular/core';
declare var PouchDB: any;
declare var localStorage: any;
@Injectable()
export class AuthService {
  logged_in;
  constructor() {
  	this.logged_in = false;

  	if(localStorage.username != null && localStorage.password != null){
  		//do login
  	}else{

  	}
  }
  is_logged_in() {
  	return this.logged_in;
  }

}
