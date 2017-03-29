import { Injectable } from '@angular/core';
import { PouchService } from '../services/pouch.service';
import { LocationsService } from '../services/locations.service';
import { Case } from '../interfaces/case';
import { Location } from '../interfaces/location';

@Injectable()
export class CasesService {

  db: any;
  data: Array<any>;
  remote;

  constructor(private pouchService: PouchService, private locationService: LocationsService) {
    this.db = this.pouchService.initDB('cases');
    this.db.createIndex({
      index: {
        fields: ['state']
      }
    }).then(function(result) {
      console.log('Created an index on cases:state');
    }).catch(function(err) {
      console.log('Failed to create an index on cases:state');
      console.log(err);
    });
  }

  store(currentCase: Case) {
    console.log(currentCase);
    this.locationService.store(currentCase.location);
    this
      .pouchService
      .db('cases')
      .post(this.getStorableForm(currentCase))
      .then(function(response) {
        console.log(response);
      })
      .catch(function(err) {
        console.error(err);
      });
  }


  getCases() {

    console.log('getting cases');
    return this.pouchService.get('cases');
  }

  getCase(id: string) {
    return Promise.resolve(this.pouchService.db('cases').get(id));
  }

  getCasesMatching(where: any) {
    return Promise.resolve(this.db.find({ selector: where }));
  }

  /**
   * Converts this object into a storable without circular
   * dependencies.
   * Removes location
   */
  private getStorableForm(c: Case) {
    let selfCopy = Object.assign({}, c);
    delete selfCopy.location;
    return selfCopy;
  }


}
