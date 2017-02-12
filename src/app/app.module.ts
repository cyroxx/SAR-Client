import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule }   from '@angular/router';

import { AppComponent } from './app.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { LeftNavComponent } from './components/left-nav/left-nav.component';
import { ChatComponent } from './components/chat/chat.component';
import { MapViewComponent } from './components/map-view/map-view.component';
import { LogInComponent } from './components/log-in/log-in.component';
import { CreateCaseFormComponent } from './components/create-case-form/create-case-form.component';

import {PouchService} from './services/pouch.service';
import {LocationService} from './services/location.service';
import {ModalService} from './services/modal.service';
import {ModalPlaceholderComponent } from './components/modalplaceholder/modalplaceholder.component';


@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
    LeftNavComponent,
    ChatComponent,
    MapViewComponent,
    LogInComponent,
    CreateCaseFormComponent,
    ModalPlaceholderComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      {
        path: '',
        component: MapViewComponent
      }
    ])
  ],
  providers: [PouchService, ModalService, LocationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
