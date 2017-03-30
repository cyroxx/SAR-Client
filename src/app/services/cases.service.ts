import { Injectable } from '@angular/core';
import { PouchService } from '../services/pouch.service';
import { AuthService } from '../services/auth.service';
import { LocationsService } from '../services/locations.service';
import { Case } from '../interfaces/case';
import { Location } from '../interfaces/location';

@Injectable()
export class CasesService {

  db: any;
  data: Array<any>;
  remote;

  constructor(private pouchService: PouchService, private locationService: LocationsService, private authService: AuthService) {
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
    currentCase.reportedBy = this.authService.getUserData().name;
    //just to be safe check for undefined location
    if (currentCase.location) {
      currentCase.location.reportedBy = this.authService.getUserData().name;
      this.locationService.store(currentCase.location);
    }
    this
      .pouchService
      .db('cases')
      .put(this.getStorableForm(currentCase))
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
    return this.pouchService.findById('cases', id);
  }

  getCasesMatching(where: any) {
    return this.pouchService.find('cases', where);
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
