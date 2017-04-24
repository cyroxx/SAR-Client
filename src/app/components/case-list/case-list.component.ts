import { Component, OnInit } from '@angular/core';

import { AppModule } from '../../app.module';

import { Case } from '../../interfaces/case';
import { BoatType } from '../../interfaces/boat-type';
import { BoatCondition } from '../../interfaces/boat-condition';
import { Status } from '../../interfaces/status';

import { CasesService } from '../../services/cases.service';
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

  constructor(public caseService: CasesService, private modalService: ModalService) {
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

      matchingPromise.then(data => {
        this.cases = data.docs
      });


    });


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
