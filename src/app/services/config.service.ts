import { Injectable } from '@angular/core';
import appConfig from 'config/config';

// Use the globally defined remote object
declare var remote: any;

// Require the settings module via electron remote to use the same instance as the main
// electron process. See: https://github.com/nathanbuchar/electron-settings/wiki/FAQs
const electronSettings = remote.require('electron-settings');

@Injectable()
export class ConfigService {

  private result: Object;

  constructor() {
    // We have to initialize the settings on every app start to make sure new settings will be
    // written to the local storage
    this.initConfiguration();
  }

  initConfiguration() {
    for (const key in appConfig) {
      // Use hasOwnProperty here to avoid setting inherited properties and to please tslint
      if (appConfig.hasOwnProperty(key)) {
        // Do not overwrite existing settings
        if (!electronSettings.has(key)) {
          console.log(`Initialize setting: ${key}="${appConfig[key]}"`);
          electronSettings.set(key, appConfig[key]);
        }
      }
    }
  }

  getConfiguration(key) {
    return electronSettings.get(key);
  }

  updateConfiguration(update, cb) {
    for (const key in update) {
      // Use hasOwnProperty here to avoid setting inherited properties and to please tslint
      if (update.hasOwnProperty(key)) {
        electronSettings.set(key, update[key]);
      }
    }

    // Execute callback after all settings have been updated
    if (cb) {
      cb();
    }
  }
}
