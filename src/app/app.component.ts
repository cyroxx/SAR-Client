import { Component, Input, Output } from '@angular/core';

import {VehiclesService} from 'app/services/vehicles.service';
import { ElectronIpcService } from 'app/services/electron-ipc.service';
import { PositionSubscription, Position } from 'app/ipc-messages';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers:[VehiclesService, ElectronIpcService]
})
export class AppComponent {
  title;
  logged_in;
  hideCreateCaseForm;
  windowOptions = {'showstartoverlay':false};
  constructor(VehiclesService:VehiclesService, ipc:ElectronIpcService){

    console.log(vehiclesService.getVehicles());
    this.title = 'SAR Client';

    this.windowOptions = { 'showstartoverlay': true };

    this.hideCreateCaseForm = true;

    // Subscribe to position updates from the main process
    ipc.subscribe(new PositionSubscription((pos: Position) => {
      console.log('POSITION', pos);
    }));
    
  }
}
