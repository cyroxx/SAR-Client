import { Injectable } from '@angular/core';

@Injectable()
export class LocationService {

  constructor() { }

  getCurrentPosition(callback: (object) => void) {
    callback({latitude: 52.000, longitude: 13.000});
  }

}
