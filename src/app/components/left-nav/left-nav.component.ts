import { Component, OnInit } from '@angular/core';

import { VehiclesService } from 'app/services/vehicles.service';
import { StatusesService } from 'app/services/statuses.service';
import { MapService } from 'app/services/map.service';


@Component({
  selector: 'left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.css'],
  providers: [VehiclesService, StatusesService, MapService]
})
export class LeftNavComponent implements OnInit {
  vehicles;
  statuses;
  VehiclesService;
  mapService;
  constructor(
    VehiclesService: VehiclesService,
    StatusesService: StatusesService,
    MapService: MapService,
  ) {
    this.VehiclesService = VehiclesService;
    this.statuses = StatusesService.statuses;
    this.mapService = MapService;
  }

  ngOnInit() {
    this.VehiclesService.getVehicles().then((data) => {
      this.vehicles = data;
    });
  }

  filter_by_status(status_id) {
    console.log('showing cases with status ' + status_id);
  }



}
