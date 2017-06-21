import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { MapService } from 'app/services/map.service';
import { VehiclesService } from 'app/services/vehicles.service';
import { CasesService } from 'app/services/cases.service';
import { LocationsService } from '../../services/locations.service';

declare var L: any;
declare var map: any;
declare var map_inited: any;
@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
})
export class MapViewComponent implements OnInit {
  public map: any;
  public map_inited: any;

  vehicles;
  cases;

  private drawVehicleInterval: any;

  constructor(
    private vehiclesService: VehiclesService,
    private casesService: CasesService,
    private locationsService: LocationsService,
    private mapService: MapService,
    private location: Location
  ) {

  }

  ngOnInit() {
    if (!map_inited)
      console.log(this.mapService.getMapObject());
    else
      this.initMap();

    this.drawVehicles();
    // call this every 60 seconds
    this.drawVehicleInterval = setInterval(function(self) {
      return function() {
        console.log('drawing!!');
        self.drawVehicles();
      };
    }(this),
      60 * 1000
    );
    // this.drawCases();
  }

  public isHidden() {
    const list = [''],
      route = this.location.path();

    return (list.indexOf(route) === -1);
  }

  ngOnDestroy() {
    if (this.drawVehicleInterval) {
      clearInterval(this.drawVehicleInterval);
    }
  }

  drawCases() {
    this.casesService.getCases().then((data) => {
      this.cases = data;
      for (const incident of this.cases) {
        const location_promise = this.locationsService.getLastLocationMatching(incident._id);
        location_promise.then((location) => {
          const location_doc = location;
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
      for (const vehicle of this.vehicles) {
        const location_promise = this.locationsService.getLastLocationMatching(vehicle._id);
        location_promise.then((location) => {
          const location_doc = location;
          if (!location_doc || !location_doc.latitude) {
            console.log('No location found for vehicle: ' + vehicle.title);
            return;
          }
          const last_update = location_doc._id.substr(0, 19).replace('T', ' ');
          this.mapService.setMarker(
            vehicle._id,
            'vehicles',
            location_doc.latitude,
            location_doc.longitude,
            '<h5>' + vehicle.title + '</h5><b>' +
            // TODO: The latitude and longitude value can be strings or numbers
            //       This should be fixed to always be numbers!
            this.parseLatitude(parseFloat(<any>location_doc.latitude)) + ' ' +
            this.parseLongitude(parseFloat(<any>location_doc.longitude)) +
            '</b><br />' + last_update,

            vehicle.marker_color,
            vehicle._id
          );
        });
      }
    });
  }
  // the following is taken from stackoverflow user mckamey at
  // http://stackoverflow.com/questions/4504956/formatting-double-to-latitude-longitude-human-readable-format
  parseLatituteOrLongitude(value: number, direction: string) {
    value = Math.abs(value);

    const degrees = Math.trunc(value);

    value = (value - degrees) * 60;

    const minutes = Math.trunc(value);
    const seconds = Math.round((value - minutes) * 60 * 10) / 10;

    return degrees + '&deg; ' + minutes + '\'' + seconds + '\'\'' + direction;
  }

  parseLatitude(value: number) {
    const direction = value < 0 ? 'S' : 'N';
    return this.parseLatituteOrLongitude(value, direction);
  }

  parseLongitude(value: number) {
    const direction = value < 0 ? 'W' : 'E';
    return this.parseLatituteOrLongitude(value, direction);
  }

  initMap() {
    console.log('initMap');

    map_inited = true;
    this.mapService.initMap();
  }
}
