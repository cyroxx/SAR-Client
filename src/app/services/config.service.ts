import { Injectable } from '@angular/core';

declare var app_config: any;
declare var fs: any;

@Injectable()
export class ConfigService {
  constructor() { }

  private result: Object;

  getConfiguration(key) {


    return app_config[key]
  }

  updateConfiguration(key, value, cb) {

    var app_config_string = "var app_config = {\n";

    for (var i in app_config) {
      if (key == i)
        app_config_string += '"' + i + '":"' + value + '",\n';
      else
        app_config_string += '"' + i + '":"' + app_config[i] + '",\n';
    }

    //remove last comma
    app_config_string = app_config_string.slice(0, -1);

    app_config_string += "\n}\n";

    fs.writeFile("dist/config/config.js", app_config_string, function(err) {
      if (err) {
        return console.log(err);
      }
      console.log("The config was updated.");
      cb();
    });

  }
}
