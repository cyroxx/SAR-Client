import { Injectable } from '@angular/core';
import { PouchService } from '../services/pouch.service';
import { Location } from '../interfaces/case';

@Injectable()
export class LocationsService {

  db: any;
  data: Array<any>;
  remote;
  pouchService: PouchService;

  constructor(pouchService: PouchService) {
    this.pouchService = pouchService;
    this.db = this.pouchService.initDB('locations');
  }

  getLocations() {

    console.log('getting locations');
    return this.pouchService.get('locations');
  }

  getLocation(id: any) {
    console.log('getting location with id ' + id);
    return Promise.resolve(this.pouchService.db('locations').get(id));
  }

  store(location: Location) {

    this
      .pouchService
      .db('locations')
      .post(location)
      .then(function (response) {
        console.log(response);
      }).catch(function (err) {
        console.error(err);
      })
      ;
    //store vehicles in db
    //    this.db.put(location).then(function (result) {
    // handle result
    //      console.log(result)
    //      console.log('...done')
    //    }).catch(function (err) {
    //      console.log(err);
    //    });

  }
}
