import { Injectable } from '@angular/core';
import {PouchService} from '../services/pouch.service';

@Injectable()
export class VehiclesService {
  db
  data
  remote
  constructor(PouchService:PouchService) {

  	this.db = PouchService.initDB('vehicles');
    
  }
  handleChange(change){

	  let changedDoc = null;
	  let changedIndex = null;

	  this.data.forEach((doc, index) => {

	    if(doc._id === change.id){
	      changedDoc = doc;
	      changedIndex = index;
	    }

	  });

	  //A document was deleted
	  if(change.deleted){
	    this.data.splice(changedIndex, 1);
	  }
	  else {

	    //A document was updated
	    if(changedDoc){
	      this.data[changedIndex] = change.doc;
	    }

	    //A document was added
	    else {
	      this.data.push(change.doc);
	    }

	  }

  }

  getVehicles(){

  	  if (this.data) {
	    return Promise.resolve(this.data);
	  }

	  return new Promise(resolve => {

	    this.db.allDocs({

	      include_docs: true

	    }).then((result) => {

	      this.data = [];

	      let docs = result.rows.map((row) => {
	        this.data.push(row.doc);
	      });

	      resolve(this.data);

	      this.db.changes({live: true, since: 'now', include_docs: true}).on('change', (change) => {
	        this.handleChange(change);
	      });

	    }).catch((error) => {

	      console.log(error);

	    });

	  });

  }
  seedVehicles(){
  	  console.log('seed vehicles...')
  	  var vehicles = [{
	    _id: new Date().toISOString(),
	    title: 'Sea-Watch 2',
	    tracking_type: 'EPAK',
	    sat_number:'+0084123123',
	    public:false,
	    api_key:'SECRET',
	    marker_color:'#17AFFA',
	    location_alarm_enabled:true,
	    location_alarm_recipents:'nic@mail,com',
	    logo_url:'data:image/png;base64,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aNqYI+oQLVadWHEolrTsXF65Fyd+Iy0LKcFLeCiC30DQRYi/D0WEBFCzkEBhlnpyXIB/w4qRcDCntwqFkZyZY1PyS16WLMpB/kDTemMlFwQU92VP6i38PlaIQch8vZG6KqpSynX4SGCdGPcOAHhz+BPDBuylEOTrQ6EBvmx+B/g0ZOXrCNBQsQJy08EE7p0gMogD6NKiCWf/NQeUKrIDIVW70f+Cdw/fR882zdjRB2WLVPCQE1uGPgBWYL8OzSs9H1PwjHYLMxrKEfXE+/L1MjxXJE61F8j+/M37KgzRMExFUJI296ApuF+k80IiG1vj+6Gk0IH2ERabtdgQdGzoRA17NdThTgPPFSnhrX1Pi80KAD8EUxpCjl77x6du4cy0toAXgCQZ0Pz427jmHo3HxvduFZSJns+4qQPAb+Dl8CYLSNRo5YfwHWPdbMXgLKyYLBLPCCXUr2vYjMQeUHeM+1AchFYrWGhQEA5zNcSVqA++Z+U2a4Tx903BPVoTNigOc0Fbxsy+eNyI/bBRBMsx93xMQXH4bY7/KAONBHW19j1LmKsnZxC24KsyBfdvWg9bQD2rkh/D/SF47mKdqnof5rBZAUD7XfGfb9g5hnH68vcer9bDVCgUroNFdWHqtYeJDccYGj80DDLyqMavUMiPRQtg0LOflIf2wjzF1BPMDozXf3/xrgo74igUCjmxaAFk5ORxj48DTio0fuQd/+bxm1TjVyh0gkULAAEXmF7CZoWI88ZmDF2aR/BKMmc5mhQKRe1iUQHAw2jMIsOpmuvqP12zQuFuWFQACoVC/1j0ASgUCv2jFIBC4cYoBaBQuDFKASgUboxSAAqFG6MUgELhxigFoFC4MUoBKBRuzP8DSmgYKoOIXmkAAAAASUVORK5CYIIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIA==',
	    speed_over_ground:8
	  },{
	    _id: new Date().toISOString(),
	    title: 'IUVENTA',
	    tracking_type: 'APP',
	    sat_number:'+0084123123',
	    public:false,
	    api_key:'SECRET',
	    marker_color:'#FF00FF',
	    location_alarm_enabled:true,
	    location_alarm_recipents:'nic@mail.com',
	    logo:'data:image/png;base64,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',
	    speed_over_ground:8
	  }
	  ];

	  //store vehicles in db
	  this.db.bulkDocs(vehicles).then(function (result) {
		  // handle result
		  console.log(result)
		  console.log('...done')
		}).catch(function (err) {
		  console.log(err);
		});

  }

}
