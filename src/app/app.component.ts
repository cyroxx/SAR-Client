import { Component, Input, Output } from '@angular/core';
import {AuthService} from 'app/services/auth.service';

import {VehiclesService} from 'app/services/vehicles.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[VehiclesService,AuthService]
})
export class AppComponent {
  title;
  logged_in;
  windowOptions = {'showstartoverlay':false};
  constructor(VehiclesService:VehiclesService, AuthService:AuthService){

  	this.logged_in = AuthService.is_logged_in();

  	VehiclesService.loadVehicles();
  	this.title = 'SAR Client'

  	this.windowOptions = {'showstartoverlay':true}
  }
}
