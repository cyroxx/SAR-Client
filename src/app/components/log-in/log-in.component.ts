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
  logged_in:false;
  constructor(AuthService:AuthService) { 
    this.AuthService = AuthService;
    this.logged_in  = AuthService.logged_in;
  }

  ngOnInit() {
  }

  doLogin(){
  	console.log('login initialized...')
    this.AuthService.login(this.loginData);


  }

}
