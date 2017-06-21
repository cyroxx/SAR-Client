import { Injectable } from '@angular/core';
import { DBClientService } from '../services/db-client.service';
import { DBTxActions, DBTxReplyMessage } from '../interfaces/db-tx';
import { ConfigService } from './config.service';
import { Location } from '../interfaces/location';

@Injectable()
export class LocationsService {
  dbClientService: DBClientService;

  constructor(dbclientService: DBClientService, configService: ConfigService) {
    this.dbClientService = dbclientService;
    this.dbClientService.newTransaction(DBTxActions.LOCATIONS_INIT, {
      localName: 'locations',
      remoteName: `${configService.getDBRemoteURL()}/locations`,
    }).catch(console.log);
  }

  getLocation(id: string): Promise<Location> {
    console.log('getting location with id:', id);

    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.LOCATIONS_GET, { id: id })
        .then((msg: DBTxReplyMessage) => {
          const location: Location = msg.payload;
          resolve(location);
        }).catch(error => reject(error));
    });
  }

  getLastLocationMatching(foreignKey: string): Promise<Location> {
    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.LOCATIONS_FIND, {
        selector: {
          itemId: foreignKey,
        },
        sort: [
          { _id: 'desc' },
        ],
        limit: 1,
      }).then((msg: DBTxReplyMessage) => {
        const location: Location = msg.payload.docs[0];
        resolve(location);
      }).catch(error => reject(error));
    });
  }

  getAllLocations(): Promise<Array<Location>> {
    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.LOCATIONS_ALL)
        .then((msg: DBTxReplyMessage) => {
          const list: Array<Location> = msg.payload.rows.map(r => r.doc);
          resolve(list);
        }).catch(error => reject(error));
    });
  }

  store(location: Location): Promise<Location> {
    console.log('storing location', location);

    return new Promise((resolve, reject) => {
      this.dbClientService.newTransaction(DBTxActions.LOCATIONS_STORE, {
        location: location,
      }).then((msg: DBTxReplyMessage) => {
        const storedLocation: Location = msg.payload;
        resolve(storedLocation);
      }).catch(error => reject(error));
    });
  }
}
