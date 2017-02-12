import { Injectable } from '@angular/core';

@Injectable()
export class LocationService {

  constructor() { }

  get() {
    return '52.000,13.000';
  }

}
