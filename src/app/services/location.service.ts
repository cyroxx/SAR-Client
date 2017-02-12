import { Injectable } from '@angular/core';
import { Bancroft } from 'bancroft';

@Injectable()
export class LocationService {

  private tracker: Bancroft;

  constructor() {
    this.tracker = new Bancroft();
    this.tracker.on('connect', function () {
      console.log('connected');
    });
    this.tracker.on('location', function (location) {
      console.log('got new location');
    });
    this.tracker.on('satellite', function (satellite) {
      console.log('got new satellite state');
    });
    this.tracker.on('disconnect', function (err) {
      console.log('disconnected');
    });
  }

  getCurrentPosition(callback: (object) => void) {
    callback({coords: {latitude: 52.537, longitude: 13.253}, timestamp: 1486924248002});
  }

}
