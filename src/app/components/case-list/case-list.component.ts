import { Component, OnInit } from '@angular/core';

import {Case, Status, BoatType, BoatCondition} from '../../interfaces/case';
import {CasesService} from '../../services/cases.service';
import { ModalContainer, Modal } from '../../interfaces/modalcontainer';

@Component({
  selector: 'app-case-list',
  templateUrl: './case-list.component.html',
  styleUrls: ['./case-list.component.css']
})

@Modal()
export class CaseListComponent implements OnInit {

  cases: Array<Case>;
  states = Status;
  boatTypes = BoatType;
  boatConditions = BoatCondition;

  constructor(private caseService: CasesService) {
   }

  ngOnInit() {

    this.caseService.getCases().then(data => {
      this.cases = data;
    });

  }

  getStateName(state: number) : string{
    return this.states[state];
  }

  getStateClassName(state: number) : string{
    return this.getStateName(state).replace(/ /g,'').toLowerCase();
  }

  getBoatTypeName(type: number) : string{
    return this.boatTypes[type];
  }

  getBoatConditionName(condition: number) : string{
    return this.boatConditions[condition];
  }


}
