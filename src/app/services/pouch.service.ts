import { Injectable } from '@angular/core';

import { ConfigService } from './config.service';

declare var PouchDB: any;
@Injectable()
export class PouchService {
	databases: any
	remote: string
	ConfigService:ConfigService
	constructor(ConfigService:ConfigService) {

		this.remote = ConfigService.getConfiguration('db_remote_url');

		//add traling slash if necessary
		this.remote = this.remote.replace(/\/?$/, '/');

	}
	initDB(db_title: string, options?: any) {

		if (!this.databases) {
			this.databases = {};
		}
		//init object for db
		this.databases[db_title] = {}

		console.log('initializing database ' + db_title);
		if (options) {
			console.log('...with following options:');
			console.log(options)
		} else {
			let options = {
				live: true,
				retry: true,
				continuous: true
			};
		}

		//init pouchDB instance
		this.databases[db_title]['pouchDB'] = new PouchDB(this.remote + db_title, options);

  	/*if(!options.skipSetup){
	  	this.databases[db_title]['pouchDB'] = new PouchDB(db_title);


	 	//add title to remote, apply options
	 	console.log('initting sync:'+this.remote+db_title);
	    this.databases[db_title]['pouchDB'].sync(this.remote+db_title, options);
    }else{
    	console.log('...skipping setup');
    	//skipsetup is used if user needs
    	//to authenticate before
    	//the database can be initialized
    }*/
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
			console.log(doc);
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
	get(db_title: string) {
		if (this.databases[db_title]['data'] && this.databases[db_title]['data'].length > 0) {
			return Promise.resolve(this.databases[db_title]['data']);
		}

		return new Promise(resolve => {

			this.databases[db_title]['pouchDB'].allDocs({

				include_docs: true

			}).then((result) => {

				this.databases[db_title]['data'] = [];

				let docs = result.rows.map((row) => {
					this.databases[db_title]['data'].push(row.doc);
				});

				resolve(this.databases[db_title]['data']);

				this.databases[db_title]['pouchDB'].changes({ live: true, since: 'now', include_docs: true }).on('change', (change) => {
					this.handleChange(db_title, change);
				});

			}).catch((error) => {

				console.log(error);

			});

		});

	}
}
