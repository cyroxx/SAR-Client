import { Injectable } from '@angular/core';

@Injectable()
export class LocationService {

  constructor() { }

  getCurrentPosition(callback: (object) => void) {
    callback({coords: {latitude: 52.537, longitude: 13.253}, timestamp: 1486924248002});
  }

}
