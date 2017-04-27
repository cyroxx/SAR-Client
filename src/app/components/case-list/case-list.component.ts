import { Component, OnInit } from '@angular/core';

import { AppModule } from '../../app.module';

import { Case } from '../../interfaces/case';
import { BoatType } from '../../interfaces/boat-type';
import { BoatCondition } from '../../interfaces/boat-condition';
import { Status } from '../../interfaces/status';

import { CasesService } from '../../services/cases.service';
import { LocationsService } from '../../services/locations.service';
import { CreateCaseFormComponent } from '../create-case-form/create-case-form.component';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.css']
})

export class CaseListComponent implements OnInit {

  cases: Array<Case>;
  toggled_cases;
  states = Status;
  boatTypes = BoatType;
  boatConditions = BoatCondition;
  caseMeta: any;

  JSON: any;
  constructor(public caseService: CasesService, public locationService: LocationsService, private modalService: ModalService) {
    this.JSON = JSON;
    this.caseMeta = { locations: {} };
  }

  ngOnInit() {

    this.toggled_cases = []

    this.caseService.filteredStatuses.subscribe((data) => {

      console.log('filtered statuses subscription called');

      let matchingPromise = this.caseService.getCasesMatching(
        {
          "state": {
            "$in": this.caseService.data
          }
        });
      var self = this;
      matchingPromise.then(data => {



        this.cases = data.docs;
        console.log(data.docs);

        var self = this;
        var initial_cases_length = this.cases.length;
        for (var x = 0; x < initial_cases_length; x++) {
          console.log(x)
          if (this.cases[x] && this.cases[x]._id) {

            console.log(this.cases[x]);

            var doc = this.cases[x];

            console.log(doc._id);
            self.loadLocationForCase(doc._id);

          }
        }

        /* OLD CRAPPY STUFF */
        /*for (var doc of data.docs) {
          self.locationService.getLastLocationMatching({
            'itemId': doc._id,
          }).then(function(loc) {
      
            console.log(doc);
      
            let case_id = doc._id;
            console.log(case_id)
            self.caseMeta.locations[case_id] = loc.docs[0];
            console.log(self.caseMeta)
      
            /*self.casemeta.dd_location.longitude = self.case.location.longitude;
            self.casemeta.dd_location.latitude = self.case.location.latitude;
      
            self.updateLocationType('DMS');
            self.updateLocationType('DD');
      
          });
        }*/

        /* OLD CRAPPY STUFF */


      });


    });


  }

  loadLocationForCase(case_id: string) {
    var self = this;
    self.locationService.getLastLocationMatching({
      'itemId': case_id,
    }).then(function(loc) {

      self.caseMeta.locations[case_id] = loc.docs[0];

    });
  }

  getLocation(case_id: string) {

    if (this.caseMeta.locations[case_id] && this.caseMeta.locations[case_id]._id)
      return 'LAT: ' + this.caseMeta.locations[case_id].latitude + '<br>LON: ' + this.caseMeta.locations[case_id].longitude;
  }

  toggleCase(case_id: string) {
    if (this.toggled_cases.indexOf(case_id) === -1)
      this.toggled_cases.push(case_id)
    else
      this.toggled_cases.splice(this.toggled_cases.indexOf(case_id))
  }

  getStateName(state: number): string {
    return this.states[state];
  }

  getStateClassName(state: number): string {
    return state ? this.getStateName(state).replace(/ /g, '').toLowerCase() : '';
  }

  getBoatTypeName(type: number): string {
    return this.boatTypes[type];
  }

  getBoatConditionName(condition: number): string {
    return this.boatConditions[condition];
  }

  showEditCaseModal(id: string) {
    this.modalService.create<CreateCaseFormComponent>(AppModule, CreateCaseFormComponent,
      {
        caseId: id
      });
  }

}
