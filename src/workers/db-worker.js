importScripts(
  '../components/pouchdb/dist/pouchdb.min.js',
  '../components/pouchdb-find/dist/pouchdb.find.min.js'
);

// We have to register the find plugin explicitly because there
// is no window object in a web worker where it might be registered
// automatically.
PouchDB.plugin(pouchdbFind);

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

      // TODO: Switch to "sync", based on a config option
      db.replicate.from(remoteName, options)
        .on('change', (info) => {
          console.log('replicate:change', info);

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
          console.log('replicate:paused', err);
          // TODO: publish online status
        })
        .on('active', () => {
          console.log('replicate:active');
          // TODO: publish online status
        })
        .on('denied', (err) => {
          console.log('replicate:denied', err);
          // TODO: publish online status
        })
        .on('complete', (info) => {
          console.log('replicate:complete', info);
          // TODO: publish online status
        })
        .on('error', (err) => {
          console.log('replicate:error', err);
          // TODO: publish online status
        });

      resolve(db);
    });
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
    const timer = `locations:find(${JSON.stringify(args.selector)})`;
    console.time(timer);
    this.db.find({
      selector: args.selector,
      limit: args.limit,
      sort: args.sort,
    }).then((data) => {
      console.timeEnd(timer);
      reply(data);
    }).catch(error);
  }

  store(args, repy, error) {
    const timer = `locations:store(${JSON.stringify(args.location)})`;
    console.time(timer);
    this.db.put(args.location).then((data) => {
      console.timeEnd(timer);
      reply(data);
    }).catch(error);
  }
}

class DBWorker {
  constructor() {
    this.databases = {};

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
        case 'session:login':
          console.log(msg.action, 'not implemented yet!');
        case 'session:logout':
          console.log(msg.action, 'not implemented yet!');
        case 'session:get':
          console.log(msg.action, 'not implemented yet!');
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
      self.postMessage({
        type: 'error',
        txid: msg.txid,
        action: msg.action,
        error: error,
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
