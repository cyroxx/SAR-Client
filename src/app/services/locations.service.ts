import { Injectable } from '@angular/core';
import { PouchService } from '../services/pouch.service';

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

  seedLocations() {
    console.log('seed locations...');
    var locations = [{
      _id: "2017-02-22T13:25:37.326Z-reportedBy-IUV",
      lattitude: '32.944263',
      longitude: '12.296566',
      heading: '0',
      origin: 'GPS',
      type: 'case'
    },
    {
      _id: "2017-02-22T13:35:37.326Z-reportedBy-SW2",
      lattitude: '32.937924',
      longitude: '12.326092',
      heading: '0',
      origin: 'GPS',
      type: 'case'
    }];

    //store vehicles in db
    this.db.bulkDocs(locations).then(function (result) {
      // handle result
      console.log(result)
      console.log('...done')
    }).catch(function (err) {
      console.log(err);
    });

  }

}
