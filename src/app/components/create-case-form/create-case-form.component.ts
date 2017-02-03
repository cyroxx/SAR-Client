import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

import { AppComponent } from '../../app.component';



import { Case } from '../../interfaces/case';


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

	constructor(private _fb: FormBuilder) {

    	this.hideCreateCaseForm = true;

	} // form builder simplify form initialization

	ngOnInit() {
	        // we will initialize our form model here
	}

	save(model: Case, isValid: boolean) {
	        this.submitted = true; // set form submit to true

	        // check if model is valid
	        // if valid, call API to save customer
	        console.log(model, isValid);
	}

}
