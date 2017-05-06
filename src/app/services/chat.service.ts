import { Injectable } from '@angular/core';
import { PouchService } from '../services/pouch.service';
import { AuthService } from '../services/auth.service';
import { LocationsService } from '../services/locations.service';
import { Message } from '../interfaces/message';

@Injectable()
export class ChatService {

  db: any;
  data: Array<any>;
  remote;

  constructor(private pouchService: PouchService, private authService: AuthService) {
    this.db = this.pouchService.initDB('messages');
    /*this.db.createIndex({
      index: {
        fields: ['state']
      }
    }).then(function(result) {
      console.log('Created an index on messages:state');
    }).catch(function(err) {
      console.log('Failed to create an index on messages:state');
      console.log(err);
    });*/


  }

  store(currentMessage: Message) {
    console.log(currentMessage);
    currentMessage.createdAt = new Date().toISOString();

    this
      .pouchService
      .db('messages')
      .put(this.getStorableForm(currentMessage))
      .then(function(response) {
        console.log(response);
      })
      .catch(function(err) {
        console.error(err);
      });
  }


  getMessages() {
    return this.pouchService.get('messages');
  }

  getMessagesMatching(where: any) {
    return this.pouchService.find('messages', where);
  }

  /**
   * Converts this object into a storable without circular
   * dependencies.
   * Removes location
   */
  private getStorableForm(c: Message) {
    let selfCopy = Object.assign({}, c);
    return selfCopy;
  }


}
