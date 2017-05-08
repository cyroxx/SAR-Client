import { Injectable } from '@angular/core';
import { PouchService } from '../services/pouch.service';
import { Location } from '../interfaces/location';

@Injectable()
export class LocationsService {

  db: any;
  data: Array<any>;
  remote;
  pouchService: PouchService;

  constructor(pouchService: PouchService) {
    this.pouchService = pouchService;
    this.db = this.pouchService.initDB('locations');
    this.db.createIndex({
      index: {
        fields: ['itemId']
      }
    }).then(function(result) {
      console.log('Created an index on location:itemId');
    }).catch(function(err) {
      console.log('Failed to create an index on location:itemId');
      console.log(err);
    });
  }

  getLocations() {

    console.log('getting locations');
    return this.pouchService.get('locations');
  }

  getLocation(id: any) {
    console.log('getting location with id ' + id);
    return Promise.resolve(this.pouchService.db('locations').get(id));
  }

  /**
   * 
   * @param foreignKey the key of the case or vehicle 
   */
  getLastLocationMatching(foreignKey: string) {
    return this.pouchService.find(
      'locations',
      {
        'itemId': foreignKey,
      },
      [{ '_id': 'desc' }],
      1,
    );
  }

  getAllLocations() {
    return this.pouchService.findAll('locations');
  }

  store(location: Location) {

    console.log(location);

    this
      .pouchService
      .db('locations')
      .post(location)
      .then(function(response) {
        console.log(response);
      }).catch(function(err) {
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
