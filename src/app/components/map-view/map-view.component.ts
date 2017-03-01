import { Component, OnInit } from '@angular/core'
import {MapService} from 'app/services/map.service'
import {VehiclesService} from 'app/services/vehicles.service'


declare var L: any;
@Component({
    selector: 'app-map-view',
    templateUrl: './map-view.component.html',
    styleUrls: ['./map-view.component.css'],
    providers:[MapService, VehiclesService]
})
export class MapViewComponent implements OnInit {
    public map: any;

    mapService;
    vehiclesService;

    constructor(MapService:MapService, VehiclesService:VehiclesService) {
        this.mapService = MapService;
        this.vehiclesService = VehiclesService;
    }

    ngOnInit() {
        this.initMap();
        this.mapService.setMarker(32.46, 16.87, 'just a test');
    }

    initMap() {
        this.mapService.initMap();
    }
}
