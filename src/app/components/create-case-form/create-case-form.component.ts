import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { AppComponent } from '../../app.component'

import { Case, Status, BoatType, BoatCondition, Location, LocationType } from '../../interfaces/case';
import { ModalContainer, Modal } from '../../interfaces/modalcontainer';
import { CasesService } from '../../services/cases.service';
import { LocationsService } from '../../services/locations.service';

@Component({
  selector: 'create-case-form',
  templateUrl: './create-case-form.component.html',
  styleUrls: ['./create-case-form.component.css'],
  providers: [FormBuilder]
})

@Modal()
export class CreateCaseFormComponent implements OnInit {
  private submitted;
  hideCreateCaseForm;
  public createCaseForm: FormGroup;
  public events: any[] = []; // use later to display form changes

  case: Case;

  @Input()
  caseId: string;

  state: Status;
  stateList: any;
  stateKeys: string[];

  boatType: BoatType;
  boatTypeList: any;
  boatTypeKeys: string[];

  boatCondition: BoatCondition;
  boatConditionList: any;
  boatConditionKeys: string[];

  constructor(private _fb: FormBuilder, private caseService: CasesService, private locationService: LocationsService) {
    this.hideCreateCaseForm = true;

    this.stateList = Status;
    this.stateKeys = Object.keys(this.stateList).filter(Number);

    this.boatTypeList = BoatType;
    this.boatTypeKeys = Object.keys(this.boatTypeList).filter(Number);

    this.boatConditionList = BoatCondition;
    this.boatConditionKeys = Object.keys(this.boatConditionList).filter(Number);

    this.case = new Case();
    this.case._id = new Date().toISOString() + "-reportedBy-SW2";
  } // form builder simplify form initialization

  ngOnInit() {
    // we will initialize our form model here
    //if caseId is present from input load it from the database
    if (this.caseId) {
      let self = this;

      this.caseService.getCase(this.caseId).then(function(c) {
        self.case = <Case>c;

        self.locationService.getLastLocationForForeignKey(self.caseId).then(function(loc) {
          self.case.location = <Location>loc.rows[0].doc;

        });
      });
    }

  }

  save() {
    this.submitted = true; // set form submit to true
    this.caseService.store(this.case);
  }

  getCurrentPosition() {
    navigator.geolocation.getCurrentPosition((position) => {
      //console.log(position);
      //@TODO add reporter from currently logged in user
      this.case.location = new Location(<number>position.coords.longitude, <number>position.coords.latitude, <number>position.coords.heading, <number>position.timestamp, this.case._id, LocationType.Case);
    });
  }

  /*setStatus(statusId : string){
    this.case.state = this.stateList[statusId];
  }

  logItem(item) {
      console.log(item);
  }*/
}
