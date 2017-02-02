import { Injectable } from '@angular/core';

@Injectable()
export class StatusesService {


  statuses;
  constructor() {

  	this.statuses = [
      {
        index:'need_help',
        title:'Need Help'
      },
      {
        index:'critical_target',
        title:'Critical'
      },
      {
        index:'confirmed_target',
        title:'Confirmed'
      },
      {
        index:'possible_target',
        title:'Possible Target'
      },
      {
        index:'attended',
        title:'Attended'
      },
      {
        index:'closed',
        title:'Closed'
      }
  	];
  	

  }

}
