importScripts(
  '../components/pouchdb/dist/pouchdb.js',
  '../components/pouchdb-find/dist/pouchdb.find.js',
  '../components/pouchdb-authentication/dist/pouchdb.authentication.js',
  'db/replicator.js',
  'db/creator.js',
  'db/session.js',
  'db/databases.js'
);

// We have to register the find and authentication plugin explicitly because there
// is no window object in a web worker where it might be registered automatically.
PouchDB.plugin(pouchdbFind);
PouchDB.plugin(PouchAuthentication);

PouchDB.debug.enable('*');

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
