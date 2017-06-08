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
      this.layer_groups[group_name].addTo(this.getMapObject());
      L.control.layers({}, this.layer_groups).addTo(this.getMapObject());
    }
    return this.layer_groups[group_name];
  }

  centerMap(latitude: number, longitude: number) {
    this.getMapObject().panTo([latitude, longitude]);
  }

  setMarker(id: string, group: string, x: number, y: number, description?: string, color?: string, title?: string) {
    const layer_group = this.getLayerGroup(group);
    // remove potential old marker
    if (id in this.markers) {
      layer_group.removeLayer(this.markers[id]);
    }
    const markerHtmlStyles = "background-color: #583470;width: 3rem;height: 3rem;display: block;left: -1.5rem;top: -1.5rem;position: relative;border - radius: 3rem 3rem 0;transform: rotate(45deg);border: 1px solid #FFFFFF";


    if(!title)
      const title = '';
    const icon = L.divIcon({
      className: 'marker',
      iconAnchor: [0, 24],
      labelAnchor: [-6, 0],
      popupAnchor: [0, -36],
      html: '<span style="' + markerHtmlStyles + '">"+title+"</span>'
    });

    /*const marker = L.marker([x, y]).addTo(layer_group);*/

    const marker = L.marker([x, y], { icon: icon }).addTo(layer_group);

    /*if (description) {
      marker.bindPopup(description);
    }*/
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
    this.map.options.maxZoom = 8;
    this.map.setView(this.startLocation, 7);
    L.control.scale({ 'imperial': false }).addTo(this.map);
    switch (this.maptype) {
      case 'offline-map':
        /*Not working until maptiles are added to the repo*/
        L.tileLayer('MapQuest/{z}/{x}/{y}.png', {
          attributionControl: false
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
