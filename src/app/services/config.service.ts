import { Injectable } from '@angular/core';
import * as fs from 'fs';


declare var app_config: any;
declare var electron_settings: any;

@Injectable()
export class ConfigService {

  private result: Object;

  constructor() {
    //sett app_config if neccessary
    if (!electron_settings.has('current_version'))
      this.initConfiguration();
  }

  initConfiguration() {
    for (var i in app_config) {
      electron_settings.set(i, app_config[i]);
      console.log(i + ' written to config');
    }

  }

  getConfiguration(key) {
    return electron_settings.get(key)
  }

  updateConfiguration(key, value, cb) {

    if (electron_settings.set(key, value))
      cb();

  }
}
