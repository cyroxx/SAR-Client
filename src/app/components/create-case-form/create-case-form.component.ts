import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { AppComponent } from '../../app.component'

import { Case, Status, BoatType, BoatCondition, Location } from '../../interfaces/case';
import { ModalContainer, Modal } from '../../interfaces/modalcontainer';

import { LocationService } from '../../services/location.service';

@Component({
    selector: 'create-case-form',
    templateUrl: './create-case-form.component.html',
    styleUrls: ['./create-case-form.component.css'],
    providers: [FormBuilder, LocationService]
})

@Modal()
export class CreateCaseFormComponent implements OnInit {
    private submitted;
    hideCreateCaseForm;
    public createCaseForm: FormGroup;
    public events: any[] = []; // use later to display form changes

    private locationService: LocationService;

    @Input()
    case: Case;

    state: Status;
    stateList: any;
    stateKeys: string[];

    boatType: BoatType;
    boatTypeList: any;
    boatTypeKeys: string[];

    boatCondition: BoatCondition;
    boatConditionList: any;
    boatConditionKeys: string[];

    constructor(private _fb: FormBuilder, locationService: LocationService) {
        this.hideCreateCaseForm = true;

        this.stateList = Status;
        this.stateKeys = Object.keys(this.stateList).filter(Number);

        this.boatTypeList = BoatType;
        this.boatTypeKeys = Object.keys(this.boatTypeList).filter(Number);

        this.boatConditionList = BoatCondition;
        this.boatConditionKeys = Object.keys(this.boatConditionList).filter(Number);

        this.case = new Case();

        this.locationService = locationService;

    } // form builder simplify form initialization

    ngOnInit() {
        // we will initialize our form model here
        //this.case = new Case();
    }

    save() {
        this.submitted = true; // set form submit to true

        // check if model is valid
        // if valid, save in database
        console.log(this.case);
    }

    getCurrentPosition() {
        console.log(this.locationService.get());
        console.log(this.case);

        this.case.location = new Location(<number>13.253, <number>52.537, <number>NaN, <number>1486924248002);

        if (navigator.geolocation) {
        console.log("Geo IS SUPPORTED!");
		   navigator.geolocation.getCurrentPosition((position) => {
		   	console.log("Position is:");
            console.log(position);
            this.case.location = new Location(<number>position.coords.longitude, <number>position.coords.latitude, <number>position.coords.heading, <number>position.timestamp);
        });
		} else {
		    console.log("Geolocation is not supported by this browser.");
		}
     
    }

    /*setStatus(statusId : string){
      this.case.state = this.stateList[statusId];
    }

    logItem(item) {
        console.log(item);
    }*/
}
