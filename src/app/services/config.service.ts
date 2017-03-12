import { Injectable } from '@angular/core';

declare var app_config: any;

@Injectable()
export class ConfigService {
  constructor() { }

  private result: Object;

  getConfiguration(key) {
    return app_config[key]
  }
}
