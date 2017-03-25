import { Component, OnInit } from '@angular/core';

import { VehiclesService } from 'app/services/vehicles.service';
import { StatusesService } from 'app/services/statuses.service';
import { MapService } from 'app/services/map.service';
import { CasesService } from '../../services/cases.service';


@Component({
  selector: 'left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.css'],
})
export class LeftNavComponent implements OnInit {
  vehicles;
  statuses;
  constructor(
    private vehiclesService: VehiclesService,
    private statusesService: StatusesService,
    private mapService: MapService,
    private casesService: CasesService,
  ) {
    this.statuses = statusesService.statuses;
  }

  ngOnInit() {
    this.vehiclesService.getVehicles().then((data) => {
      this.vehicles = data;
    });
  }

  filter_by_status(status_id) {
    console.log('showing cases with status ' + status_id);
    let matchingPromise = this.casesService.getCasesMatching({
      'state': status_id.toString(),
    });
    matchingPromise.then((data) => {
      console.log(data);
      this.mapService.filter_on_cases('wat');
    });
  }



}
