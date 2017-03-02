import { Injectable } from '@angular/core';
import { PouchService } from '../services/pouch.service';

@Injectable()
export class CasesService {

  db: any;
  data: Array<any>;
  remote;
  pouchService: PouchService;

  constructor(pouchService: PouchService) {
    this.pouchService = pouchService;
    this.db = this.pouchService.initDB('cases');
  }

  getCases() {

    console.log('getting cases');
    return this.pouchService.get('cases');
  }

}
