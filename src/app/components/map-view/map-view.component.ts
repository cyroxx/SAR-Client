import { Component, OnInit } from '@angular/core'
import {MapService} from 'app/services/map.service'


declare var L: any;
@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css'],
  providers:[MapService]
})
export class MapViewComponent implements OnInit {
	public map: any;
	mapService;
  	constructor(MapService:MapService) {
  		this.mapService = MapService;
  	}

  	ngOnInit() {
  		this.initMap();	
  	}

  	initMap(){

  		this.mapService.initMap()
	}
}
