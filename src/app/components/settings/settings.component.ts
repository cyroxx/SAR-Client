import { Component, OnInit } from '@angular/core';
import { PouchService } from '../../services/pouch.service';

import { ConfigService } from '../../services/config.service';
import AppVersion from 'config/version';

import * as semver from 'semver';

declare var shell: any;
declare var os: any;
declare var helpers: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  db
  data
  remote
  pouchService
  current_version
  update_info
  configService
  platform
  settings_info
  db_remote_url

  constructor(pouchService: PouchService, configService: ConfigService) {

    this.pouchService = pouchService
    this.configService = configService
    this.current_version = AppVersion.version;
    this.db_remote_url = this.configService.getConfiguration('db_remote_url');

    this.settings_info = {};
    this.settings_info.show = false;

    this.platform = os.platform();

    console.log('PLATFORM', this.platform);

    this.db = this.pouchService.initDB('versions');
    this.checkForUpdates()
  }

  ngOnInit() {

  }
  checkForUpdates() {

    this.update_info = {}
    this.update_info.status_obj = {}

    this.getVersions();

    var self = this;

    this.db.allDocs({

      include_docs: true

    }).then((result) => {

      this.data = [];

      let docs = result.rows.map((row) => {
        this.data.push(row.doc);
      });

      if (this.data[0]) {


        var latest_version_obj = this.data[0]; var minimum_accepted_version = latest_version_obj.minimum_accepted_version;

        var latest_accepted_version = latest_version_obj._id;

        var download_link;
        var filesize;
        //get the right download link
        switch (self.platform) {
          case 'linux':
            download_link = latest_version_obj.download_links.linux.link;
            filesize = latest_version_obj.download_links.linux.filesize;
            break;
          case 'win32':
            download_link = latest_version_obj.download_links.win.link;
            filesize = latest_version_obj.download_links.win.filesize;
            break;
          case 'darwin':
            download_link = latest_version_obj.download_links.mac.link;
            filesize = latest_version_obj.download_links.mac.filesize;
            break;
        }

        //if current version of this client is lower than the minimum accepted version
        //update required
        if (semver.lt(this.current_version, minimum_accepted_version)) {
          //update required
          self.update_info.status_obj = {
            'status': 'update_required',
            'version': latest_version_obj._id,
            'link': download_link,
            'filesize': filesize
          }
          self.settings_info.show = true;
        }

        //update possible
        if (semver.lt(this.current_version, latest_accepted_version)) {
          self.update_info.status_obj = {
            'status': 'update_possible',
            'version': latest_version_obj._id,
            'link': download_link,
            'filesize': filesize
          }
          self.settings_info.show = true;
        }
      }




    }).catch((error) => {

      console.log(error);

    });

  }

  getVersions() {

    if (this.data) {
      return Promise.resolve(this.data);
    }

    return new Promise(resolve => {

      this.db.allDocs({

        include_docs: true

      }).then((result) => {

        this.data = [];

        let docs = result.rows.map((row) => {
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

  updateRemote() {
    this.configService.updateConfiguration('db_remote_url', this.db_remote_url, function() {
      //updated!
      helpers.alert('Remote URL was updated');
      helpers.reload();

    });
  }

  openExternal(link) {
    shell.openExternal(link)
  }
  closeSettings() {
    if (this.update_info.status_obj.status != 'update_required')
      this.settings_info.show = false;
    else
      helpers.alert('You need to update before you can proceed!')
  }
}
