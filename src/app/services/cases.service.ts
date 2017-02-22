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

    if (this.data) {
      return Promise.resolve(this.data);
    }

    return new Promise(resolve => {

      this.db.allDocs({

        include_docs: true

      }).then((result) => {

        this.data = [];

        let docs = result.rows.map((row) => {
          this.data.push(row.doc);
        });

        resolve(this.data);

        this.db.changes({ live: true, since: 'now', include_docs: true }).on('change', (change) => {
          this.pouchService.handleChange('cases', change);
        });

      }).catch((error) => {

        console.log(error);

      });

    });

  }

  seedCases() {
    /*location: Location;
    state: Status;
    boatType: BoatType;
    boatCondition: BoatCondition;
    engineWorking: boolean;
    peopleCount: number;
    womenCount: number;
    childrenCount: number;
    disabledCount: number;*/
    console.log('seed cases...');
    var cases = [{
      _id: new Date().toISOString() + "-reportedBy-" + "IUV",
      location: "2017-02-22T13:25:37.326Z-reportedBy-IUV",
      state: '1',
      boatType: '1',
      boatCondition: '2',
      engineWorking: false,
      peopleCount: 150,
      womenCount: 22,
      childrenCount: 18,
      disabledCount: 2
    },
    {
      _id: new Date().toISOString() + "-reportedBy-" + "SW2",
      location: "2017-02-22T13:35:37.326Z-reportedBy-SW2",
      state: '1',
      boatType: '1',
      boatCondition: '2',
      engineWorking: false,
      peopleCount: 150,
      womenCount: 22,
      childrenCount: 18,
      disabledCount: 2
    }];

    //store vehicles in db
    this.db.bulkDocs(cases).then(function (result) {
      // handle result
      console.log(result)
      console.log('...done')
    }).catch(function (err) {
      console.log(err);
    });

  }

}
