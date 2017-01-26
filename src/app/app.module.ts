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

@NgModule({
  declarations: [
    AppComponent,
    TopNavComponent,
    LeftNavComponent,
    ChatComponent,
    MapViewComponent,
    LogInComponent
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
