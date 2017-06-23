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

class DBReplicator {
  constructor(dbName, db, remoteDb, onChange) {
    this.dbName = dbName;
    this.db = db;
    this.remoteDb = remoteDb;
    this.onChange = onChange;
    this.replicator = null;
  }

  stop() {
    if (this.replicator) {
      this.replicator.cancel();
    }
  }

  // Available options: {live: true, retry: true, continuous: true, include_docs: true}
  startSync(options) {
    if (this.replicator) {
      return;
    }
    console.log('db:sync:start', this.dbName, options);
    this.replicator = this.db.sync(this.remoteDb, options)
      .on('change', (info) => {
        console.log('replicate:change', this.dbName, info);

        // Notify all listeners for remote changes
        if (info.direction === 'pull') {
          this.onChange(this.dbName, {
            docs: info.docs,
            errors: info.errors,
            docs_read: info.docs_read,
            docs_written: info.docs_written,
          });
        }
      })
      .on('paused', err => console.log('replicate:paused', this.dbName, err))
      .on('active', () => console.log('replicate:active', this.dbName))
      .on('denied', err => console.log('replicate:denied', this.dbName, err))
      .on('complete', info => console.log('replicate:complete', this.dbName, info))
      .on('error', err => console.log('replicate:error', this.dbName, err));
  }

  // Available options: {live: true, retry: true, continuous: true, include_docs: true}
  startFromRemote(options) {
    if (this.replicator) {
      return;
    }
    console.log('db:replicate-from-remote:start', this.dbName, options);
    this.replicator = this.db.replicate.from(this.remoteDb, options)
      .on('change', (info) => {
        console.log('replicate:change', this.dbName, info);

        // Notify all listeners for remote changes
        this.onChange(this.dbName, {
          docs: info.docs,
          errors: info.errors,
          docs_read: info.docs_read,
          docs_written: info.docs_written,
        });
      })
      .on('paused', err => console.log('replicate:paused', this.dbName, err))
      .on('active', () => console.log('replicate:active', this.dbName))
      .on('denied', err => console.log('replicate:denied', this.dbName, err))
      .on('complete', info => console.log('replicate:complete', this.dbName, info))
      .on('error', err => console.log('replicate:error', this.dbName, err));
  }
}

class DBCreator {
  static init(args) {
    return new Promise((resolve, reject) => {
      const localName = args.localName;
      const remoteName = args.remoteName;

      if (!localName) {
        reject(new Error('Cannot initialize database without localName argument'));
        return;
      }
      if (!remoteName) {
        reject(new Error('Cannot initialize database without remoteName argument'));
        return;
      }

      const db = new PouchDB(localName);
      const remoteDb = new PouchDB(remoteName, { skip_setup: true });

      console.log(`db:initialize(local=${db.type()}:${localName}, remote=${remoteDb.type()}:${remoteName})`);
      resolve({ db: db, remoteDb: remoteDb });
    });
  }
}

class DBBase {
  constructor(dbName, db, remoteDb, onChange) {
    this.dbName = dbName;
    this.db = db;
    this.remoteDb = remoteDb;
    this.replicator = new DBReplicator(dbName, db, remoteDb, onChange);
  }

  createIndex(fields) {
    const log = `${this.dbName}:create-index(${JSON.stringify(fields)})`;
    console.time(log);
    this.db.createIndex({
      index: {
        fields: fields,
      }
    }).then(result => {
      console.timeEnd(log);
    }).catch(err => {
      console.log(`Could not create index on ${this.dbName}=>${JSON.stringify(fields)}`, err);
    });
  }

  all(options, reply, error) {
    const log = `${this.dbName}:all`;
    console.time(log);
    this.db.allDocs(options).then((data) => {
      console.timeEnd(log);
      reply(data);
    }).catch(error);
  }

  get(args, reply, error) {
    const log = `${this.dbName}:get(${args.id})`
    console.time(log)
    this.db.get(args.id).then((data) => {
      console.timeEnd(log);
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

    const log = `${this.dbName}:find(${JSON.stringify(args.selector)})`;
    console.time(log);
    this.db.find(findOptions).then((data) => {
      console.timeEnd(log);
      reply(data);
    }).catch(error);
  }

  store(args, reply, error) {
    const timer = `${this.dbName}:store(${JSON.stringify(args.payload)})`;
    console.time(timer);
    this.db.put(args.payload).then((data) => {
      console.timeEnd(timer);
      reply(data);
    }).catch(error);
  }

  clearLocalDatabase() {
    // Make sure that we do not clear a remote database!
    if (this.db.type().indexOf('http') < 0) {
      return this.db.destroy();
    } else {
      return Promise.reject(new Error(`Not clearing remote database <${this.dbName}>`));
    }
  }
}

class DBMessages extends DBBase {
  constructor(db, remoteDb, onChange) {
    super('messages', db, remoteDb, onChange);
    this.replicator.startSync({
      live: true,
      retry: true,
      continuous: true,
      include_docs: true
    });
  }
}

class DBVersions extends DBBase {
  constructor(db, remoteDb, onChange) {
    super('versions', db, remoteDb, onChange);
    this.replicator.startSync({
      live: true,
      retry: true,
      continuous: true,
      include_docs: true
    });
  }
}

class DBVehicles extends DBBase {
  constructor(db, remoteDb, onChange) {
    super('vehicles', db, remoteDb, onChange);
    this.replicator.startSync({
      live: true,
      retry: true,
      continuous: true,
      include_docs: true
    });
  }
}

class DBCases extends DBBase {
  constructor(db, remoteDb, onChange) {
    super('cases', db, remoteDb, onChange);
    this.createIndex(['state']);
    this.replicator.startSync({
      live: true,
      retry: true,
      continuous: true,
      include_docs: true
    });
  }
}

class DBLocations extends DBBase {
  constructor(db, remoteDb, onChange) {
    super('locations', db, remoteDb, onChange);
    this.createIndex(['itemId']);
    this.replicator.startSync({
      live: true,
      retry: true,
      continuous: true,
      include_docs: true
    });
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
    self.onerror = error => console.log('Error receiving message:', error);
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

    //console.log('dispatchMessage', msg);

    try {
      switch (msg.action) {
        case 'locations:init':
          DBCreator.init(msg.args).then((v) => {
            this.databases['locations'] = new DBLocations(v.db, v.remoteDb, this.onChange);
          }).catch(console.log);
          break;
        case 'locations:all':
          this.db('locations').all({
            include_docs: true,
            descending: true,
          }, this.reply(msg), this.error(msg));
          break;
        case 'locations:get':
          this.db('locations').get(msg.args, this.reply(msg), this.error(msg));
          break;
        case 'locations:find':
          this.db('locations').find(msg.args, this.reply(msg), this.error(msg));
          break;
        case 'locations:store':
          this.db('locations').store(msg.args, this.reply(msg), this.error(msg));
          break;

        case 'cases:init':
          DBCreator.init(msg.args).then((v) => {
            this.databases['cases'] = new DBCases(v.db, v.remoteDb, this.onChange);
          }).catch(console.log);
          break;
        case 'cases:all':
          this.db('cases').all({
            include_docs: true
          }, this.reply(msg), this.error(msg));
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
          DBCreator.init(msg.args).then((v) => {
            this.databases['vehicles'] = new DBVehicles(v.db, v.remoteDb, this.onChange);
          }).catch(console.log);
          break;
        case 'vehicles:all':
          this.db('vehicles').all({
            include_docs: true,
          },this.reply(msg), this.error(msg));
          break;

        case 'messages:init':
          DBCreator.init(msg.args).then((v) => {
            this.databases['messages'] = new DBMessages(v.db, v.remoteDb, this.onChange);
          }).catch(console.log);
          break;
        case 'messages:all':
          this.db('messages').all({
            include_docs: true,
          }, this.reply(msg), this.error(msg));
          break;
        case 'messages:find':
          this.db('messages').find(msg.args, this.reply(msg), this.error(msg));
          break;
        case 'messages:store':
          this.db('messages').store(msg.args, this.reply(msg), this.error(msg));
          break;

        case 'versions:init':
          DBCreator.init(msg.args).then((v) => {
            this.databases['versions'] = new DBVersions(v.db, v.remoteDb, this.onChange);
          }).catch(console.log);
          break;
        case 'versions:all':
          this.db('versions').all({
            include_docs: true,
          }, this.reply(msg), this.error(msg));
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
