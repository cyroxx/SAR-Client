import { Component, OnInit, ComponentRef } from '@angular/core';

import {AppModule} from '../../app.module';
import {CreateCaseFormComponent} from '../create-case-form/create-case-form.component';
import {ModalService} from '../../services/modal.service';

@Component({
    selector: 'top-nav',
    templateUrl: './top-nav.component.html',
    styleUrls: ['./top-nav.component.css']
})

export class TopNavComponent implements OnInit {
    title: string;

    constructor(private modalService: ModalService) {
        this.title = 'top nav'
    }

    ngOnInit() {
    }

    showCreateCaseModal() {
        this.modalService.create<CreateCaseFormComponent>(AppModule, CreateCaseFormComponent,
        {
            foo: "bar",
            onSave: () => alert('save me')
        });

    }

}
