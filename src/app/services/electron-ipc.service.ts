import { Injectable } from '@angular/core';
import { Subscription } from 'app/ipc-messages';

// The ipcRendere variable gets defined in the global state in src/index.html
declare var ipcRenderer: any;

@Injectable()
export class ElectronIpcService {
  constructor() {
  }

  subscribe(subscription: Subscription) {
    ipcRenderer.on(subscription.channel(), subscription.callback());
  }
}
