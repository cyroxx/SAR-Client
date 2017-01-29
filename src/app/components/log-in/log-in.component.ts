import { Component, OnInit } from '@angular/core';
import {AuthService} from 'app/services/auth.service';

@Component({
  selector: 'log-in-window',
  templateUrl: './log-in.component.html',
  styleUrls: ['./log-in.component.css'],
  providers:[AuthService]
})
export class LogInComponent implements OnInit {
  loginData = {};
  AuthService;
  logged_in:boolean;
  constructor(AuthService:AuthService) { 
    this.logged_in = false;
    this.AuthService = AuthService;

    AuthService.changeLoginState.subscribe(res => this.logged_in = res);
    var self = this;

    setInterval(function(){ 
    console.log('logged_in:');
    console.log(self.logged_in) 
    }, 3000);
  }

  ngOnInit() {
  }

  doLogin(){
  	console.log('login submitted...')
    this.AuthService.login(this.loginData);


  }

}
