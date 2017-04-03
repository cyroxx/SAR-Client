import { Component, OnInit, ComponentRef } from '@angular/core';

import { AppModule } from '../../app.module';
import { CreateCaseFormComponent } from '../create-case-form/create-case-form.component';
import { CaseListComponent } from '../case-list/case-list.component';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'top-nav',
  templateUrl: './top-nav.component.html',
  styleUrls: ['./top-nav.component.css']
})

export class TopNavComponent implements OnInit {
  title: string;
  authService
  is_online
  constructor(private modalService: ModalService, AuthService: AuthService) {
    this.title = 'top nav'
    this.authService = AuthService
  }

  ngOnInit() {
    //this.is_online = this.authService.pouchService.getConnectionState();
    this.authService.pouchService.onlineState.subscribe((value: any) => this.is_online = value)
  }

  logout() {
    console.log('logout called');
    window.localStorage.clear()
    this.authService.logout()
    console.log('logout worked...');
  }

  showCreateCaseModal() {
    this.modalService.create<CreateCaseFormComponent>(AppModule, CreateCaseFormComponent,
      {
      });
  }

}
