import { Injectable } from '@angular/core';
import { PouchService } from '../services/pouch.service';

@Injectable()
export class VehiclesService {
  db;
  data;
  promise;
  remote;
  pouchService;

  constructor(pouchService: PouchService) {
    this.pouchService = pouchService;
    this.db = this.pouchService.initDB('vehicles');
  }

  getVehicles() {
    // If we already fetched the data, just return that
    if (this.data) {
      return Promise.resolve(this.data);
    }

    // Check if there is an existing promise already to avoid the creation
    // of another one when getVehicles() gets called before the promise
    // has finished.
    if (!this.promise) {
      this.promise = this.newPromise();
    }

    return this.promise;
  }

  newPromise() {
    return new Promise(resolve => {

      this.db.allDocs({

        include_docs: true

      }).then((result) => {

        this.data = [];

        const docs = result.rows.map((row) => {
          this.data.push(row.doc);
        });

        resolve(this.data);

        this.db.changes({ live: true, since: 'now', include_docs: true }).on('change', (change) => {
          this.pouchService.handleChange('vehicles', change);
        });

      }).catch((error) => {

        console.log(error);

      });

    });

  }
}
