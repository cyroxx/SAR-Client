import { Component, OnInit } from '@angular/core';

import { VehiclesService } from 'app/services/vehicles.service';
import { StatusesService } from 'app/services/statuses.service';
import { MapService } from 'app/services/map.service';
import { CasesService } from '../../services/cases.service';

import { Status } from '../../interfaces/status';


@Component({
  selector: 'left-nav',
  templateUrl: './left-nav.component.html',
  styleUrls: ['./left-nav.component.css'],
})
export class LeftNavComponent implements OnInit {
  vehicles;
  statuses;
  filtered_statuses;
  states = Status;
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
  getStatusFilters() {
    return this.casesService.getFilteredStatuses();
  }
  getStatusClasses(status_index) {
    return this.states[status_index] + ' ' + ((this.casesService.getFilteredStatuses().indexOf(status_index) > -1) ? 'active' : '')
  }

  filter_by_status(status_id) {

    //add or remove status from filters
    this.casesService.toggleStatusFilter(status_id);

    console.log('showing cases with statusses ' + JSON.stringify(this.casesService.getFilteredStatuses()));


    let matchingPromise = this.casesService.getCasesMatching(
      {
        "state": {
          "$in": this.casesService.getFilteredStatuses()
        }
      });
    matchingPromise.then((data) => {
      console.log(data);
      this.mapService.filter_on_cases('wat');
    });
  }



}
