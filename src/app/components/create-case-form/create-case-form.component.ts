import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { AppComponent } from '../../app.component'

import { Case } from '../../interfaces/case';
import { Status } from '../../interfaces/status';
import { BoatType } from '../../interfaces/boat-type';
import { BoatCondition } from '../../interfaces/boat-condition';
import { Location } from '../../interfaces/location';
import { LocationType } from '../../interfaces/location-type';
import { Listener } from '../../interfaces/listener';

import { ModalContainer, Modal } from '../../interfaces/modalcontainer';
import { CasesService } from '../../services/cases.service';
import { LocationsService } from '../../services/locations.service';
import { AuthService } from '../../services/auth.service';
import { PouchService } from '../../services/pouch.service';


@Component({
  selector: 'create-case-form',
  templateUrl: './create-case-form.component.html',
  styleUrls: ['./create-case-form.component.css'],
  providers: [FormBuilder]
})

@Modal()
export class CreateCaseFormComponent implements OnInit, Listener {
  private submitted;
  hideCreateCaseForm;
  public createCaseForm: FormGroup;
  public events: any[] = []; // use later to display form changes
  public edited: boolean = false;

  case: Case;
  change: Case;

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

  constructor(private _fb: FormBuilder, private caseService: CasesService, private locationService: LocationsService, private authService: AuthService, private pouchService: PouchService) {
    this.hideCreateCaseForm = true;

    this.stateList = Status;
    this.stateKeys = Object.keys(this.stateList).filter(Number);

    this.boatTypeList = BoatType;
    this.boatTypeKeys = Object.keys(this.boatTypeList).filter(Number);

    this.boatConditionList = BoatCondition;
    this.boatConditionKeys = Object.keys(this.boatConditionList).filter(Number);

    //typecast needed because we only have the id at this moment and we don't want
    //to explicitly initialize all the other fields
    this.case = <Case>{
      _id: new Date().toISOString() + "-reportedBy-" + authService.getUserData().name
    };

  } // form builder simplify form initialization

  ngOnInit() {
    this.pouchService.registerRemoteChangeListener(this);

    // we will initialize our form model here
    //if caseId is present from input load it from the database
    const self = this;

    if (this.caseId) {

      this.caseService.getCase(this.caseId).then(function(c) {
        self.case = <Case>c;

        self.locationService.getLastLocationMatching({
          'itemId': self.caseId,
        }).then(function(loc) {
          console.log(loc);

          self.case.location = <Location>loc.docs[0];

        });

      });
    } else {
      this.case.location = {
        _id: new Date().toISOString() + "-reportedBy-" + self.authService.getUserData().name,
        longitude: 0,
        latitude: 0,
        heading: 0,
        timestamp: 0,
        itemId: self.case._id,
        type: LocationType.Case
      };
    }


  }

  notify(change): void {
    console.log("CHANGE");
    console.log(change);
    change.docs.forEach((c) => {
      console.log(c);

      if (c._id === this.case._id) {
        this.change = c;
        this.edited = true;
      }
    });
  }

  save() {
    this.submitted = true; // set form submit to true
    this.caseService.store(this.case);
  }

  refresh() {
    const self = this;

    this.case = this.change;
    this.locationService.getLastLocationMatching({
      'itemId': this.caseId,
    }).then(function(loc) {
      console.log(loc);
      self.case.location = <Location>loc.docs[0];

    });
    this.edited = false;
  }

  getCurrentPosition() {
    const self = this;
    navigator.geolocation.getCurrentPosition((position) => {
      //console.log(position);
      //@TODO add reporter from currently logged in user
      self.case.location = {
        _id: new Date().toISOString() + "-reportedBy-" + self.authService.getUserData().name,
        longitude: position.coords.longitude,
        latitude: position.coords.latitude,
        heading: position.coords.heading,
        timestamp: position.timestamp,
        itemId: self.case._id,
        type: LocationType.Case,
        reportedBy: self.authService.getUserData().name
      };
    });
  }

  /*setStatus(statusId : string){
    this.case.state = this.stateList[statusId];
  }

  logItem(item) {
      console.log(item);
  }*/
}
