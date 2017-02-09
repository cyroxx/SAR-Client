import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { AppComponent } from '../../app.component';



import { Case, Status, BoatType, BoatCondition, Location } from '../../interfaces/case';

@Component({
    selector: 'create-case-form',
    templateUrl: './create-case-form.component.html',
    styleUrls: ['./create-case-form.component.css'],
    providers: [FormBuilder]
})


export class CreateCaseFormComponent implements OnInit {
    private submitted;
    hideCreateCaseForm;
    public createCaseForm: FormGroup;
    public events: any[] = []; // use later to display form changes

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

    constructor(private _fb: FormBuilder) {
        this.hideCreateCaseForm = false;

        this.stateList = Status;
        this.stateKeys = Object.keys(this.stateList).filter(Number);

        this.boatTypeList = BoatType;
        this.boatTypeKeys = Object.keys(this.boatTypeList).filter(Number);

        this.boatConditionList = BoatCondition;
        this.boatConditionKeys = Object.keys(this.boatConditionList).filter(Number);

        this.case = new Case();
    } // form builder simplify form initialization

    ngOnInit() {
        // we will initialize our form model here
        //this.case = new Case();
    }

    save(model: Case, isValid: boolean) {
        this.submitted = true; // set form submit to true

        // check if model is valid
        // if valid, call API to save customer
        console.log(model, isValid);
    }

    getCurrentPosition() {
        navigator.geolocation.getCurrentPosition((position) => {
            //console.log(position);
            this.case.location = new Location(<number>position.coords.longitude, <number>position.coords.latitude, <number>position.coords.heading, <number>position.timestamp);
        });
    }

    logItem(item) {
        console.log(item);
    }
}
