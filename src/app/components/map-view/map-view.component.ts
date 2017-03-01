import { Component, OnInit } from '@angular/core'
import { MapService } from 'app/services/map.service'
import { CasesService } from 'app/services/cases.service'
import { LocationsService } from 'app/services/locations.service'
import { Case } from '../../interfaces/case';


declare var L: any;
@Component({
	selector: 'app-map-view',
	templateUrl: './map-view.component.html',
	styleUrls: ['./map-view.component.css'],
	providers: [MapService]
})
export class MapViewComponent implements OnInit {
	public map: any;
	mapService;
	cases: Array<Case>;
	caseService: CasesService;
	locationService: LocationsService;

	constructor(MapService: MapService, caseService: CasesService, locationService: LocationsService) {
		this.mapService = MapService;
		this.caseService = caseService;
		this.locationService = locationService;
	}

	ngOnInit() {
		this.initMap();

		this.caseService.getCases().then((data) => {
			this.cases = data;
				
		});
	}

	initMap() {

		this.mapService.initMap()
	}
}
