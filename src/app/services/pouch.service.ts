import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ConfigService } from './config.service';

declare var PouchDB: any;
@Injectable()
export class PouchService {
  databases: any
  remote: string
  //onlineState: any
  ConfigService: ConfigService  // Observable string source
  onlineStateSource = new Subject<string>();

  public onlineState = new BehaviorSubject('offline');
  // Observable string stream
  constructor(ConfigService: ConfigService) {

    this.remote = ConfigService.getConfiguration('db_remote_url');

    //add traling slash if necessary
    this.remote = this.remote.replace(/\/?$/, '/');
  }
  // Service message commands
  setOnlineState(state: string) {
    this.onlineState.next(state)
  }

  reinitializeDBs() {
    for (var key in this.databases) {
      this.initDB(key);
    }
  }
  initDB(db_title: string, options?: any) {

    if (!this.databases) {
      this.databases = {};
    }
    //init object for db
    this.databases[db_title] = {}

    var self = this;

    console.log('initializing database ' + db_title);
    if (options) {
      console.log('...with following options:');
      console.log(options)
    } else {
      let options = {
        live: true,
        retry: true,
        continuous: true,
        include_docs: true
      };
    }

    //init pouchDB instance
    //this.databases[db_title]['pouchDB'] = new PouchDB(this.remote + db_title, options);
    if (!options || !options.skipSetup) {
      this.databases[db_title]['pouchDB'] = new PouchDB(db_title);

      //add title to remote, apply options
      console.log('initting sync:' + this.remote + db_title);
      this.databases[db_title]['pouchDB'].sync(this.remote + db_title, options).on('change', function (change) {
        // yo, something changed!
        console.log('on: true');

        self.setOnlineState('online')
      }).on('paused', function (error) {
        //sync is paused even if everything is ok
        //so the state will only be changed if it
        //is paused because of an error

        if (error) {
          self.setOnlineState('offline')
          console.log('on: false');
        }
      }).on('active', function (info) {
        console.log('on: true');
        self.setOnlineState('online')
        // replication was resumed
      }).on('error', function (err) {
        console.log('on: false');
        self.setOnlineState('offline')
        // totally unhandled error (shouldn't happen)
      });
    } else {
      console.log('...skipping setup');
      //skipsetup is used if user needs
      //to authenticate before
      //the database can be initialized
    }
    this.databases[db_title]['data'] = []
    return this.databases[db_title]['pouchDB']

  }

  db(db_title: string) {
    return this.databases[db_title]['pouchDB']
  }

  handleChange(db_title: string, change) {
    let changedDoc = null;
    let changedIndex = null;

    this.databases[db_title]['data'].forEach((doc, index) => {
      if (doc._id === change.id) {
        changedDoc = doc;
        changedIndex = index;
      }

    });

    //A document was deleted
    if (change.deleted) {
      this.databases[db_title]['data'].splice(changedIndex, 1);
    }
    else {

      //A document was updated
      if (changedDoc) {
        this.databases[db_title]['data'][changedIndex] = change.doc;
      }

      //A document was added
      else {
        this.databases[db_title]['data'].push(change.doc);
      }
    }
  }
  getConnectionState() {
    return this.onlineState;
  }
  get(db_title: string) {
    if (this.databases[db_title]['data'] && this.databases[db_title]['data'].length > 0) {
      return Promise.resolve(this.databases[db_title]['data']);
    }

    return new Promise(resolve => {

      this.databases[db_title]['pouchDB'].allDocs({

        include_docs: true

      }).then((result) => {

        this.databases[db_title]['data'] = [];

        console.log('result.rows');
        console.log(result.rows);

        let docs = result.rows.map((row) => {
          this.databases[db_title]['data'].push(row.doc);
        });

        resolve(this.databases[db_title]['data']);

        this.databases[db_title]['pouchDB'].changes({ live: true, retry: true, since: 'now', include_docs: true }).on('change', (change) => {
          this.handleChange(db_title, change);
        });

      }).catch((error) => {

        resolve([]);

      });

    });

  }

  find(db_title: string, where: any){
    if (this.databases[db_title]['pouchDB']) {
      return Promise.resolve(this.databases[db_title]['pouchDB'].find({ selector: where }));
    }
    return Promise.reject('No database with name [' + db_title + ']');
  }

  findById(db_title: string, id: string){
    if (this.databases[db_title]['pouchDB']) {
      return Promise.resolve(this.databases[db_title]['pouchDB'].get(id));
    }
    return Promise.reject('No database with name [' + db_title + ']');
  }
}
