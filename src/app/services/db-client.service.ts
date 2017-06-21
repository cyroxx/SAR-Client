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
  private dbWorker: Worker;
  private transactions: { [txid: string]: DBTxCallback };
  private listeners: { [id: string]: ListenerEntry };

  constructor() {
    this.transactions = {};
    this.listeners = {};
    this.dbWorker = dbWorker;

    this.dbWorker.onmessage = (msg) => this.dispatch(msg.data);
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

  public addChangeListener(dbName: string, listener: Listener): string {
    const id = uuid();
    this.listeners[id] = new ListenerEntry(dbName, listener);
    return id;
  }

  public removeChangeListener(id: string): void {
    delete this.listeners[id];
  }
}
