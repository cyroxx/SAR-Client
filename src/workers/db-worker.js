importScripts(
  '../components/pouchdb/dist/pouchdb.js',
  '../components/pouchdb-find/dist/pouchdb.find.js',
  '../components/pouchdb-authentication/dist/pouchdb.authentication.js'
);

// We have to register the find and authentication plugin explicitly because there
// is no window object in a web worker where it might be registered automatically.
PouchDB.plugin(pouchdbFind);
PouchDB.plugin(PouchAuthentication);

PouchDB.debug.enable('*');

class DBInitializer {
  static init(args, onChange, reply, error) {
    return new Promise((resolve, reject) => {
      const localName = args.localName;
      const remoteName = args.remoteName;

      if (!localName) {
        error(new Error('Cannot initialize database without localName argument'));
      }
      if (!remoteName) {
        error(new Error('Cannot initialize database without remoteName argument'));
      }

      const db = new PouchDB(localName);

      // TODO: Make configurable
      const options = {
        live: true,
        retry: true,
        continuous: true,
        include_docs: true
      };

      console.log('db:initialize', localName, remoteName, options);
      console.log('db:type', localName, db.type());
      console.log('db:type', remoteName, new PouchDB(remoteName).type());

      // TODO: Switch to "sync", based on a config option
      // TODO: Store the replication/sync object so we can cancel it!
      db.replicate.from(remoteName, options)
        .on('change', (info) => {
          console.log('replicate:change', localName, info);

          // Notify all listeners for remote changes
          // TODO: When using "replicate.from", thre is no info.direction field
          //if (info.direction === 'pull') {
            onChange(localName, {
              docs: info.docs,
              errors: info.errors,
              docs_read: info.docs_read,
              docs_written: info.docs_written,
            });
          //}

          // TODO: publish online status
        })
        .on('paused', (err) => {
          console.log('replicate:paused', localName, err);
          // TODO: publish online status
        })
        .on('active', () => {
          console.log('replicate:active', localName);
          // TODO: publish online status
        })
        .on('denied', (err) => {
          console.log('replicate:denied', localName, err);
          // TODO: publish online status
        })
        .on('complete', (info) => {
          console.log('replicate:complete', localName, info);
          // TODO: publish online status
        })
        .on('error', (err) => {
          console.log('replicate:error', localName, err);
          // TODO: publish online status
        });

      resolve(db);
    });
  }
}

class DBMessages {
  constructor(db) {
    this.db = db;
  }

  all(reply, error) {
    console.time('messages:all');
    this.db.allDocs({ include_docs: true }).then((data) => {
      console.timeEnd('messages:all');
      reply(data);
    }).catch(error);
  }

  find(args, reply, error) {
    const findOptions = {};

    if (args.selector) {
      findOptions.selector = args.selector;
    }
    if (args.limit) {
      findOptions.limit = args.limit;
    }
    if (args.sort) {
      findOptions.sort = args.sort;
    }

    const timer = `messages:find(${JSON.stringify(args.selector)})`;
    console.time(timer);
    this.db.find(findOptions).then((data) => {
      console.timeEnd(timer);
      reply(data);
    }).catch(error);
  }

  store(args, reply, error) {
    const timer = `messages:store(${JSON.stringify(args.message)})`;
    console.time(timer);
    this.db.put(args.message).then((data) => {
      console.timeEnd(timer);
      reply(data);
    }).catch(error);
  }

  clearLocalDatabase() {
    // Make sure that we do not clear a remote database!
    if (this.db.type().indexOf('http') < 0) {
      return this.db.destroy();
    } else {
      return Promise.reject(new Error(`Not clearing remote database <${this.db.db_name}>`));
    }
  }
}

class DBVersions {
  constructor(db) {
    this.db = db;
  }

  all(reply, error) {
    console.time('versions:all');
    this.db.allDocs({ include_docs: true }).then((data) => {
      console.timeEnd('versions:all');
      reply(data);
    }).catch(error);
  }

  clearLocalDatabase() {
    // Make sure that we do not clear a remote database!
    if (this.db.type().indexOf('http') < 0) {
      return this.db.destroy();
    } else {
      return Promise.reject(new Error(`Not clearing remote database <${this.db.db_name}>`));
    }
  }
}

class DBVehicles {
  constructor(db) {
    this.db = db;
  }

  all(reply, error) {
    console.time('vehicles:all');
    this.db.allDocs({ include_docs: true }).then((data) => {
      console.timeEnd('vehicles:all');
      reply(data);
    }).catch(error);
  }

  clearLocalDatabase() {
    // Make sure that we do not clear a remote database!
    if (this.db.type().indexOf('http') < 0) {
      return this.db.destroy();
    } else {
      return Promise.reject(new Error(`Not clearing remote database <${this.db.db_name}>`));
    }
  }
}

class DBCases {
  constructor(db) {
    this.db = db;
    this.createIndex();
  }

  createIndex() {
    console.time('cases:create-index(state)');
    this.db.createIndex({
      index: {
        fields: ['state']
      }
    }).then(function (result) {
      console.timeEnd('cases:create-index(state)');
    }).catch(function (err) {
      console.log('Could not create index on cases=>state', err);
    });
  }

  all(reply, error) {
    console.time('cases:all');
    this.db.allDocs({ include_docs: true }).then((data) => {
      console.timeEnd('cases:all');
      reply(data);
    }).catch(error);
  }

  get(args, reply, error) {
    const timer = `cases:get(${args.id})`
    console.time(timer)
    this.db.get(args.id).then((data) => {
      console.timeEnd(timer);
      reply(data);
    }).catch(error);
  }

  find(args, reply, error) {
    const findOptions = {};

    if (args.selector) {
      findOptions.selector = args.selector;
    }
    if (args.limit) {
      findOptions.limit = args.limit;
    }
    if (args.sort) {
      findOptions.sort = args.sort;
    }

    const timer = `cases:find(${JSON.stringify(args.selector)})`;
    console.time(timer);
    this.db.find(findOptions).then((data) => {
      console.timeEnd(timer);
      reply(data);
    }).catch(error);
  }

  store(args, reply, error) {
    const timer = `cases:store(${JSON.stringify(args.case)})`;
    console.time(timer);
    this.db.put(args.case).then((data) => {
      console.timeEnd(timer);
      reply(data);
    }).catch(error);
  }

  clearLocalDatabase() {
    // Make sure that we do not clear a remote database!
    if (this.db.type().indexOf('http') < 0) {
      return this.db.destroy();
    } else {
      return Promise.reject(new Error(`Not clearing remote database <${this.db.db_name}>`));
    }
  }
}

class DBLocations {
  constructor(db) {
    this.db = db;
    this.createIndex();
  }

  createIndex() {
    console.time('locations:create-index(itemId)');
    this.db.createIndex({
      index: {
        fields: ['itemId']
      }
    }).then(function (result) {
      console.timeEnd('locations:create-index(itemId)');
    }).catch(function (err) {
      console.log('Could not create index on locations=>itemId', err);
    });
  }

  all(reply, error) {
    console.time('locations:all');
    this.db.allDocs({ include_docs: true, descending: true }).then((data) => {
      console.timeEnd('locations:all');
      reply(data);
    }).catch(error);
  }

  get(args, reply, error) {
    const timer = `locations:get(${args.id})`
    console.time(timer)
    this.db.get(args.id).then((data) => {
      console.timeEnd(timer);
      reply(data);
    }).catch(error);
  }

  find(args, reply, error) {
    const findOptions = {};

    if (args.selector) {
      findOptions.selector = args.selector;
    }
    if (args.limit) {
      findOptions.limit = args.limit;
    }
    if (args.sort) {
      findOptions.sort = args.sort;
    }

    const timer = `locations:find(${JSON.stringify(args.selector)})`;
    console.time(timer);
    this.db.find(findOptions).then((data) => {
      console.timeEnd(timer);
      reply(data);
    }).catch(error);
  }

  store(args, reply, error) {
    const timer = `locations:store(${JSON.stringify(args.location)})`;
    console.time(timer);
    this.db.put(args.location).then((data) => {
      console.timeEnd(timer);
      reply(data);
    }).catch(error);
  }

  clearLocalDatabase() {
    // Make sure that we do not clear a remote database!
    if (this.db.type().indexOf('http') < 0) {
      return this.db.destroy();
    } else {
      return Promise.reject(new Error(`Not clearing remote database <${this.db.db_name}>`));
    }
  }
}

class Session {
  constructor(args) {
    this.db = new PouchDB(args.remoteName, { skip_setup: true });
  }

  login(args, reply, error) {
    this.db.login(args.username, args.password, (err, response) => {
      if (err) {
        console.log('Error logging into database:', this.db.name || this.db.db_name, err);
        error(err);
      } else {
        console.log('Successfully logged into database:', this.db.name || this.db.db_name);
        reply(response);
      }
    });
  }

  getSession(reply, error) {
    this.db.getSession((err, response) => {
      if (err) {
        console.log('Error getting database session info', err);
        error(err);
      } else {
        reply(response);
      }
    });
  }
}

class DBWorker {
  constructor() {
    this.databases = {};
    this.session = null;

    self.onmessage = event => this.dispatchMessage(event.data);
  }

  /* Dispatches an incoming DB request message.
   * A request message has the following structure:
   *
   *     { txid: string, action: string, args: { [name: string]: any } }
   *
   * See: DBTxRequestMessage
   */
  dispatchMessage(msg) {
    if (!msg || !msg.action) {
      console.log('ERROR: Invalid message:', msg);
      return;
    }

    console.log('dispatchMessage', msg);

    try {
      switch (msg.action) {
        case 'locations:all':
          this.db('locations').all(this.reply(msg), this.error(msg));
          break;
        case 'locations:get':
          this.db('locations').get(msg.args, this.reply(msg), this.error(msg));
          break;
        case 'locations:store':
          this.db('locations').store(msg.args, this.reply(msg), this.error(msg));
          break;
        case 'locations:find':
          this.db('locations').find(msg.args, this.reply(msg), this.error(msg));
          break;
        case 'locations:init':
          DBInitializer.init(msg.args, this.onChange, this.reply(msg), this.error(msg))
            .then((db) => {
              this.databases['locations'] = new DBLocations(db);
            })
          break;

        case 'cases:init':
          DBInitializer.init(msg.args, this.onChange, this.reply(msg), this.error(msg))
            .then((db) => {
              this.databases['cases'] = new DBCases(db);
            })
          break;
        case 'cases:all':
          this.db('cases').all(this.reply(msg), this.error(msg));
          break;
        case 'cases:get':
          this.db('cases').get(msg.args, this.reply(msg), this.error(msg));
          break;
        case 'cases:find':
          this.db('cases').find(msg.args, this.reply(msg), this.error(msg));
          break;
        case 'cases:store':
          this.db('cases').store(msg.args, this.reply(msg), this.error(msg));
          break;

        case 'vehicles:init':
          DBInitializer.init(msg.args, this.onChange, this.reply(msg), this.error(msg))
            .then((db) => {
              this.databases['vehicles'] = new DBVehicles(db);
            })
          break;
        case 'vehicles:all':
          this.db('vehicles').all(this.reply(msg), this.error(msg));
          break;

        case 'messages:init':
          DBInitializer.init(msg.args, this.onChange, this.reply(msg), this.error(msg))
            .then((db) => {
              this.databases['messages'] = new DBMessages(db);
            })
          break;
        case 'messages:all':
          this.db('messages').all(this.reply(msg), this.error(msg));
          break;
        case 'messages:find':
          this.db('messages').find(msg.args, this.reply(msg), this.error(msg));
          break;
        case 'messages:store':
          this.db('messages').store(msg.args, this.reply(msg), this.error(msg));
          break;

        case 'versions:init':
          DBInitializer.init(msg.args, this.onChange, this.reply(msg), this.error(msg))
            .then((db) => {
              this.databases['versions'] = new DBVersions(db);
            })
          break;
        case 'versions:all':
          this.db('versions').all(this.reply(msg), this.error(msg));
          break;

        case 'db:clear:all':
          this.clearAll(this.reply(msg), this.error(msg));
          break;

        case 'session:init':
          if (!msg.args.remoteName) {
            this.error(msg)(new Error('No remote database given, unable to create session db.'));
            return;
          }
          this.session = new Session(msg.args);
          this.reply(msg)({ success: true });
          break;
        case 'session:login':
          if (!this.session) {
            this.error(msg)(new Error('Session db has not been initialized yet'));
            return;
          }
          this.session.login(msg.args, this.reply(msg), this.error(msg));
          break;
        case 'session:logout':
          console.log(msg.action, 'not implemented yet!');
          break;
        case 'session:get':
          if (!this.session) {
            this.error(msg)(new Error('Session db has not been initialized yet'));
            return;
          }
          this.session.getSession(this.reply(msg), this.error(msg));
          break;
        default:
          console.log('Unknown action', msg.action);
      }
    } catch (e) {
      this.error(msg)(e);
    }
  }

  db(name) {
    if (this.databases[name]) {
      return this.databases[name];
    }
    throw new Error(`Database <${name}> is not initialized`);
  }

  clearAll(reply, error) {
    let jobs = [];
    let errors = [];

    for (const dbName in this.databases) {
      try {
        const job = this.databases[dbName].clearLocalDatabase().then((result) => {
          console.log(`Cleared local database <${dbName}>`, result);
        }).catch((error) => {
          console.log(`Couldn't clear local database <${dbName}>`, error);
          errors.push(error);
        });
        jobs.push(job);
      } catch (e) {
        errors.push(e);
      }
    }

    // Make sure we wait until all deletion jobs are finished before we reply
    Promise.all(jobs).then(() => {
      if (errors.length > 0) {
        error(errors);
      } else {
        reply({ success: true });
      }
    }).catch((error) => {
      error(error);
    });
  }

  reply(msg) {
    return (data) => {
      self.postMessage({
        type: 'reply',
        txid: msg.txid,
        action: msg.action,
        payload: data,
      })
    };
  }

  error(msg) {
    return (error) => {
      let errorObject = error;
      // An Error object cannot be serialized in postMessage so make sure we have a
      // serializable object.
      if (error instanceof Error) {
        errorObject = { message: error.toString(), name: error.name };
      }
      self.postMessage({
        type: 'error',
        txid: msg.txid,
        action: msg.action,
        error: errorObject,
      });
    };
  }

  onChange(dbName, change) {
    self.postMessage({
        type: 'change',
        txid: null,
        payload: {
          dbName: dbName,
          change: change,
        },
    });
  }
}

const dbWorker = new DBWorker();

/*
self.onmessage = (e) => dispatchMessage(e.data);

function dispatchMessage(msg) {
}

function initDB(db_title, options) {

  if (!this.databases) {
    this.databases = {};
  }
  //init object for db
  this.databases[db_title] = {};

  const self = this;

  console.log('initializing database ' + db_title);
  if (options) {
    console.log('...with following options:');
    console.log(options);
  } else {
    options = {
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
    console.log('initing sync:', this.remote + db_title, 'with options', options);
    this.databases[db_title]['pouchDB'].sync(this.remote + db_title, options).on('change', function (change) {
      // yo, something changed!
      console.log('on: true');
      console.log('change detected: ');
      console.log(change);

      //notify all listeners for remote changes
      if (change.direction === 'pull') {
        self.remoteChangeListeners.forEach((listener) => { listener.notify(change.change); });
      }

      self.setOnlineState('online');
    }).on('paused', function (error) {
      //sync is paused even if everything is ok
      //so the state will only be changed if it
      //is paused because of an error

      if (!navigator.onLine) {
        self.setOnlineState('offline');
        console.log('on: false');
      } else {
        self.setOnlineState('online');
      }
    }).on('active', function (info) {
      console.log('on: true');
      self.setOnlineState('online');
      // replication was resumed
    }).on('error', function (err) {
      console.log('on: false');
      self.setOnlineState('offline');
      // totally unhandled error (shouldn't happen)
    });
  } else {
    console.log('...skipping setup');
    //skipsetup is used if user needs
    //to authenticate before
    //the database can be initialized
  }
  this.databases[db_title]['data'] = [];
  return this.databases[db_title]['pouchDB'];

}

function findLatestLocationInAll(db) {
  console.time('findLatestLocationInAll');
  db.allDocs({ include_docs: true, descending: true }).then((data) => {
    console.timeEnd('findLatestLocationInAll');

    console.time('findSW2');
    for (const idx in data.rows) {
      const row = data.rows[idx];
      if (row.doc && row.doc.itemId && row.doc.itemId === 'SW2') {
        console.timeEnd('findSW2');
        $('#output').append(JSON.stringify(row.doc, null, 2) + "\n");
        return;
      }
    }
  });
}
function findLatestLocation(db) {
  console.time('findLatestLocation');
  // When using descending=true, the startkey and endkey must be reversed as well!
  db.allDocs({ include_docs: true, descending: true, endkey: 'SW2', startkey: 'SW2\uffff', limit: 1 }).then((data) => {
    console.timeEnd('findLatestLocation');

    $('#output').text(data.rows.length + "\n");
    $('#output').append(JSON.stringify(data.rows, null, 2) + "\n");
    data.rows.forEach(row => {
      //$('#output').append(JSON.stringify(row.doc) + "\n");
      //$('#output').append(row.doc.itemId + "\n");
    });
  });
}

function createIndex(db, fields, callback) {
  db.createIndex({
    index: {
      fields: fields,
    }
  }).then(function (result) {
    console.log(`Created an index on`, fields);
    if (callback) {
      callback();
    }
  }).catch(function (err) {
    console.log(`Failed to create an index on`, fields);
    console.log(err);
  });
}

function listIndexes(db) {
  db.getIndexes().then((result) => {
    $('#output').text(JSON.stringify(result, null, 2));
  }).catch((err) => {
    console.log(err);
  });
}

function replicate(db) {
  //const rep = db.replicate.from('https://sea-watch.cloudant.com/locations_207-06-15')
  const rep = db.replicate.from('https://sea-watch.cloudant.com/locations')

  rep.on('denied', err => {
    console.log('denied', err);
  });
  rep.on('error', err => {
    console.log('error', err);
  });
  rep.on('complete', info => {
    console.log('complete', info);
  });
}

function copyToNewDb(db, newDb) {
  db.allDocs({ include_docs: true }).then((data) => {
    data.rows.forEach(row => {
      const doc = row.doc;

      if (doc._id.indexOf('-locationOf-') < 0) {
        return;
      }

      delete doc._rev;

      // 2017-06-18T20:10:02.623Z-locationOf-SW2
      const s = doc._id.split('-locationOf-');

      doc._id = `${s[1]}-${s[0]}`;

      console.log('creating', doc);
      const action = newDb.put(doc);
      Promise.all([action]);
    });
  });
}
*/
