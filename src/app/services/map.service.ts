import { Injectable } from '@angular/core';
declare var L: any;
@Injectable()
export class MapService {
    map;
    startLocation;
    mapContainerId;
    maptype;

    constructor() {
        this.maptype = 'OSM'
    }

    getMapObject() {
        if (this.map == null) {
            this.initMap();
        }
        return this.map;
    }

    setMarker(x:number, y:number, description?:string) {
        var marker = L.marker([x, y]).addTo(this.getMapObject());
        if (description) {
            marker.bindPopup(description);
        }
        return marker;
    }


    initMap() {
        //init leaflet
        this.mapContainerId = 'client_map_container';
        this.startLocation = [32.46, 16.87]
        this.maptype = 'osm'

        this.map = L.map(this.mapContainerId, '')
        this.map.options.maxZoom = 9;
        this.map.setView(this.startLocation, 7);;
        var self = this;
        switch(this.maptype){
        case'offline-map':
            /*Not working until maptiles are added to the repo*/
            L.tileLayer('MapQuest/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://sea-watch.org">Sea-Watch</a>'
            }).addTo(this.map);
        break;
        case'osm':
            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(this.map);
            break;
        }
        return this.map;
    }
}
