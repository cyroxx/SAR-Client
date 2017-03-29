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
    this.db.createIndex({
      index: {
        fields: ['state']
      }
    }).then(function (result) {
      console.log('Created an index on cases:state');
    }).catch(function (err) {
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
      .put(this.getStorableForm(currentCase))
      .then(function (response) {
        console.log(response);
      })
      .catch(function (err) {
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

  listenForChanges(caseId: string, onChange: Function) {
    this.db.changes({
      since: 'now',
      live: true,
      include_docs: true
    }).on('change', function (change) {
      console.log("CHANGE");
      console.log(change);      
      if (caseId === change.doc._id) {
        onChange(change)
      }
    }).on('complete', function (info) {
      console.log("COMPLETE");
      console.log(info);
    }).on('error', function (err) {
      console.log(err);
    });
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
