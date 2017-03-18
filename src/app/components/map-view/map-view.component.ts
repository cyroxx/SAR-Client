import { Component, OnInit } from '@angular/core'
import { MapService } from 'app/services/map.service'
import { VehiclesService } from 'app/services/vehicles.service'
import { CasesService } from 'app/services/cases.service'
import { LocationsService } from '../../services/locations.service';

declare var L: any;
@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
  providers: [MapService, VehiclesService, CasesService, LocationsService]
})
export class MapViewComponent implements OnInit {
  public map: any;

  mapService;
  casesService;
  vehiclesService;
  locationsService;

  vehicles;
  cases;

  constructor(
    mapService: MapService,
    vehiclesService: VehiclesService,
    casesService: CasesService,
    locationsService: LocationsService,
  ) {
    this.mapService = mapService;
    this.vehiclesService = vehiclesService;
    this.casesService = casesService;
    this.locationsService = locationsService;
  }

  ngOnInit() {
    this.initMap();
    this.drawVehicles();
    this.drawCases();
  }

  drawCases() {
    this.casesService.getCases().then((data) => {
      this.cases = data;
      for (let incident of this.cases) {
        let location_promise = this.locationsService.getLastLocationForForeignKey(incident._id);
        location_promise.then((location) => {
          let location_doc = location.rows[0].doc;
          if (!location_doc) {
            console.log('No location found for case: ' + incident._id);
            return;
          }
          this.mapService.setMarker(
            'case-' + incident._id,
            location_doc.latitude,
            location_doc.longitude,
            incident._id,
          );
        });
      }
    });
  }

  drawVehicles() {
    this.vehiclesService.getVehicles().then((data) => {
      this.vehicles = data;
      for (let vehicle of this.vehicles) {
        let location_promise = this.locationsService.getLastLocationForForeignKey(vehicle._id);
        location_promise.then((location) => {
          let location_doc = location.rows[0].doc;
          if (!location_doc) {
            console.log('No location found for vehicle: ' + vehicle.name);
            return;
          }
          this.mapService.setMarker(
            'vehicle-' + vehicle._id,
            location_doc.latitude,
            location_doc.longitude,
            vehicle.name,
          );
        });
      }
    });
  }

  initMap() {
    this.mapService.initMap();
  }
}
