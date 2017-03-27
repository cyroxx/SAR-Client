import { Injectable } from '@angular/core';
declare var L: any;
@Injectable()
export class MapService {
  map;
  startLocation;
  mapContainerId;
  maptype;
  markers = {};
  layer_groups = {};

  constructor() {
    this.maptype = 'OSM';
  }

  getMapObject() {
    if (!this.map) {
      return this.initMap();
    }
    return this.map;
  }

  getLayerGroup(group_name: string) {
    if (!(group_name in this.layer_groups)) {
      this.layer_groups[group_name] = L.layerGroup();
      this.layer_groups[group_name].addTo(this.map);
    }
    return this.layer_groups[group_name];
  }

  setMarker(id: string, group: string, x: number, y: number, description?: string) {
    const layer_group = this.getLayerGroup(group);
    // remove potential old marker
    if (id in this.markers) {
      layer_group.removeLayer(this.markers[id]);
    }
    const marker = L.marker([x, y]).addTo(layer_group);
    if (description) {
      marker.bindPopup(description);
    }
    this.markers[id] = marker;
    return marker;
  }

  filter_on_cases(cases) {
    const group = this.getLayerGroup('cases');
    const case_markers = group.getLayers();
    console.log(case_markers);
  }


  initMap() {
    // init leaflet
    this.mapContainerId = 'client_map_container';
    this.startLocation = [32.46, 16.87];
    this.maptype = 'offline-map';

    this.map = L.map(this.mapContainerId, '');
    this.map.options.maxZoom = 9;
    this.map.setView(this.startLocation, 7);
    switch (this.maptype) {
      case 'offline-map':
        /*Not working until maptiles are added to the repo*/
        L.tileLayer('MapQuest/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://sea-watch.org">Sea-Watch</a>'
        }).addTo(this.map);
        break;
      case 'osm':
        L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);
        break;
    }
    return this.map;
  }
}
