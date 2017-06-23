import { Injectable } from '@angular/core';
import uuid from 'uuid/v4';
import {
  DBTxActions,
  DBTxCallback,
  DBTxReplyMessage,
  DBTxRequestMessage,
  DBTxRequestArgs
} from '../interfaces/db-tx';
import { Listener } from '../interfaces/listener';
import { ConfigService } from './config.service';

// Use the globally defined dbWorker variable to be able to communicate
// with the PouchDB web worker.
declare const dbWorker: any;

class ListenerEntry {
  public dbName: string;
  public listener: Listener;

  constructor(dbName: string, listener: Listener) {
    this.dbName = dbName;
    this.listener = listener;
  }
}

@Injectable()
export class DBClientService {
  private configService: ConfigService;
  private dbWorker: Worker;
  private transactions: { [txid: string]: DBTxCallback };
  private listeners: { [id: string]: ListenerEntry };

  constructor(configService: ConfigService) {
    this.configService = configService;
    this.transactions = {};
    this.listeners = {};
    this.dbWorker = dbWorker;

    this.dbWorker.onmessage = (msg) => this.dispatch(msg.data);

    this.initializeSession();
  }

  private initializeSession() {
    this.newTransaction(DBTxActions.SESSION_INIT, {
      remoteName: `${this.configService.getDBRemoteURL()}/_users`,
    })
      .then((response) => console.log('Initialized session db'))
      .catch((error) => console.log('Error initializing session db', error));
  }

  private dispatch(msg: DBTxReplyMessage): void {
    switch (msg.type) {
      case 'change':
        this.dispatchChange(msg);
        break;
      default:
        this.dispatchReply(msg);
    }
  }

  private dispatchChange(msg: DBTxReplyMessage): void {
    // TODO: Notify all change listeners!
    console.log('GOT CHANGE', msg);
  }

  private dispatchReply(msg: DBTxReplyMessage): void {
    if (!this.transactions[msg.txid]) {
      console.log('No transaction for ID:', msg.txid);
      return;
    }

    this.transactions[msg.txid](msg);
    delete this.transactions[msg.txid];
  }

  public newTransaction(action: string, args: DBTxRequestArgs = {}): Promise<DBTxReplyMessage> {
    const txid = uuid();
    const request: DBTxRequestMessage = {
      txid: txid,
      action: action,
      args: args,
    };

    return new Promise((resolve, reject) => {
      this.transactions[txid] = (msg: DBTxReplyMessage) => resolve(msg);
      this.dbWorker.postMessage(request);
    });
  }

  public login(username: string, password: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.newTransaction(DBTxActions.SESSION_LOGIN, {
        username: username,
        password: password,
      }).then((response) => {
        if (response.type === 'error') {
          reject(response.error);
        } else {
          resolve(response.payload);
        }
      }).catch(reject);
    });
  }

  public getSession(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.newTransaction(DBTxActions.SESSION_GET)
        .then((response) => {
          if (response.type === 'error') {
            reject(response.error);
          } else {
            resolve(response.payload);
          }
        })
        .catch(reject);
    });
  }

  public initializeDatabase(dbName: string): Promise<DBTxReplyMessage> {
    return new Promise((resolve, reject) => {
      this.newTransaction(`${dbName}:init`, {
        localName: dbName,
        remoteName: `${this.configService.getDBRemoteURL()}/${dbName}`,
      })
        .then((response) => {
          if (response.type === 'error') {
            reject(response.error);
          } else {
            resolve(response.payload);
          }
        })
        .catch(reject);
    });
  }

  public clearAllDatabases(): Promise<DBTxReplyMessage> {
    return new Promise((resolve, reject) => {
      this.newTransaction(DBTxActions.DB_CLEAR_ALL)
        .then((response) => {
          if (response.type === 'error') {
            reject(response.error);
          } else {
            resolve(response.payload);
          }
        })
        .catch(reject);
    });
  }

  public addChangeListener(dbName: string, listener: Listener): string {
    const id = uuid();
    this.listeners[id] = new ListenerEntry(dbName, listener);
    return id;
  }

  public removeChangeListener(id: string): void {
    delete this.listeners[id];
  }
}
