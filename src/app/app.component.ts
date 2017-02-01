import { Component, Input, Output } from '@angular/core';
import {VehiclesService} from 'app/services/vehicles.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[VehiclesService]
})
export class AppComponent {
  title;
  logged_in;
  windowOptions = {'showstartoverlay':false};
  constructor(VehiclesService:VehiclesService){

  	console.log(VehiclesService.getVehicles());
  	this.title = 'SAR Client'

  	this.windowOptions = {'showstartoverlay':true}

    //VehiclesService.seedVehicles();
  }
}
