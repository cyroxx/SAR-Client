import { Component, OnInit } from '@angular/core';

import {Case} from '../../interfaces/case';
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

  constructor(private caseService: CasesService) { }

  ngOnInit() {

    this.caseService.getCases().then(data => {
      this.cases = data;
    });

  }

}
