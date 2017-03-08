import { Injectable } from '@angular/core';
import { PouchService } from '../services/pouch.service';
import { LocationsService } from '../services/locations.service';
import { Case, Location } from '../interfaces/case';

@Injectable()
export class CasesService {

  db: any;
  data: Array<any>;
  remote;

  constructor(private pouchService: PouchService, private locationService: LocationsService) {
    this.db = this.pouchService.initDB('cases');
  }

  store(c: Case) {
    console.log('saving case ' + c);
    this.locationService.store(c.location);
    this
    .pouchService
    .db('cases')
    .post(c)
    .then(function(response){
      console.log(response)
    })
    .catch(function(err){
      console.error(err);
    });
  }


  getCases() {

    console.log('getting cases');
    return this.pouchService.get('cases');
  }

  getCase(id: string){
    return Promise.resolve(this.pouchService.db('cases').get(id));
  }


}
