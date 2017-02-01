import { Component, OnInit } from '@angular/core';

import {VehiclesService} from 'app/services/vehicles.service';
import {StatusesService} from 'app/services/statuses.service';


@Component({
  selector: 'left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.css'],
  providers:[VehiclesService,StatusesService]
})
export class LeftNavComponent implements OnInit {
  vehicles;
  statuses;
  VehiclesService;
  constructor(VehiclesService:VehiclesService,StatusesService:StatusesService) { 
  	this.VehiclesService = VehiclesService;
    this.statuses = StatusesService.statuses;
  }

  ngOnInit() {

    this.VehiclesService.getVehicles().then((data) => {
      this.vehicles = data;

      //if data is empty seed vehicles
      //dev only
      if(data.length === 0)
      	this.VehiclesService.seedVehicles();
    });
  }

}
