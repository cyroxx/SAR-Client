import { Component, OnInit } from '@angular/core'
import { MapService } from 'app/services/map.service'
import { VehiclesService } from 'app/services/vehicles.service'
import { CasesService } from 'app/services/cases.service'
import { LocationsService } from '../../services/locations.service';

declare var L: any;
declare var map: any;
@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
})
export class MapViewComponent implements OnInit {
  public map: any;

  vehicles;
  cases;

  constructor(
    private vehiclesService: VehiclesService,
    private casesService: CasesService,
    private locationsService: LocationsService,
    private mapService: MapService,
  ) {
  }

  ngOnInit() {
    this.initMap();
    this.drawVehicles();
    //this.drawCases();
  }

  drawCases() {
    this.casesService.getCases().then((data) => {
      this.cases = data;
      for (let incident of this.cases) {
        let location_promise = this.locationsService.getLastLocationMatching(incident._id);
        location_promise.then((location) => {
          let location_doc = location.docs[0];
          if (!location_doc || !location_doc.latitude) {
            console.log('No location found for case: ' + incident._id);
            return;
          }
          this.mapService.setMarker(
            incident._id,
            'cases',
            location_doc.latitude,
            location_doc.longitude,
            incident._id + ' at ' + location_doc.latitude + ' ' + location_doc.longitude,
          );
        });
      }
    });
  }

  drawVehicles() {
    this.vehiclesService.getVehicles().then((data) => {
      this.vehicles = data;
      for (let vehicle of this.vehicles) {
        let location_promise = this.locationsService.getLastLocationMatching(vehicle._id);
        location_promise.then((location) => {
          let location_doc = location.docs[0];
          if (!location_doc || !location_doc.latitude) {
            console.log('No location found for vehicle: ' + vehicle.title);
            return;
          }
          this.mapService.setMarker(
            vehicle._id,
            'vehicles',
            location_doc.latitude,
            location_doc.longitude,
            '<h5>' + vehicle.title + '</h5>' + location_doc.latitude + ' ' + location_doc.longitude,
          );
        });
      }
    });
  }

  initMap() {
    this.mapService.initMap();
  }
}
