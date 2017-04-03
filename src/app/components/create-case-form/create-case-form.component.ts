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

  casemeta: any;

  constructor(private _fb: FormBuilder, private caseService: CasesService, private locationService: LocationsService) {
    this.hideCreateCaseForm = true;

    this.casemeta = {
      location_type: 'DMS',
      dms_location: {
        latitude: { degree: 0, minute: 0, second: 0, direction: 'N' },
        longitude: { degree: 0, minute: 0, second: 0, direction: 'E' }
      }
    }


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

  updateLocationType(type) {
    var self = this;
    this.casemeta.location_type = type;
    switch (type) {
      case 'DMS':
        //convert lat
        if (!this.casemeta.dd_location)
          this.casemeta.dd_location = {};
        this.casemeta.dd_location.latitude = this.convertDMSToDD(this.casemeta.dms_location.latitude.degree, this.casemeta.dms_location.latitude.minute, this.casemeta.dms_location.latitude.second, this.casemeta.dms_location.latitude.direction);

        //convert lon
        this.casemeta.dd_location.longitude = this.convertDMSToDD(this.casemeta.dms_location.longitude.degree, this.casemeta.dms_location.longitude.minute, this.casemeta.dms_location.longitude.second, this.casemeta.dms_location.longitude.direction);
        console.log(this.casemeta.dms_location);
        console.log(this.casemeta.dd_location);
        break;
      case 'DG':

        this.casemeta.dg_location = {};
        //convert lon
        this.casemeta.dg_location.latitude = this.convertDDToDMS(this.casemeta.dd_location.latitude);

        this.casemeta.dg_location.longitude = this.convertDDToDMS(this.casemeta.dd_location.longitude);

        break;

    }
  }

  convertDDToDMS(deg) {
    var d = Math.floor(deg);
    var minfloat = (deg - d) * 60;
    var m = Math.floor(minfloat);
    var secfloat = (minfloat - m) * 60;
    var s = Math.round(secfloat);
    // After rounding, the seconds might become 60. These two
    // if-tests are not necessary if no rounding is done.
    if (s == 60) {
      m++;
      s = 0;
    }
    if (m == 60) {
      d++;
      m = 0;
    }
    return {
      degree: d,
      minute: m,
      second: s,
      direction: 'N'
    }
  }
  convertDMSToDD(degrees, minutes, seconds, direction) {
    var dd = degrees + minutes / 60 + seconds / (60 * 60);

    if (direction == "S" || direction == "W") {
      dd = dd * -1;
    }
    return dd;
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
