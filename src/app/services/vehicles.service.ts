import { Injectable } from '@angular/core';
declare var PouchDB: any;
@Injectable()
export class VehiclesService {

  constructor() { }
  loadVehicles(){
  	var db = new PouchDB('http://localhost:5984/vehicles');

  }

}
