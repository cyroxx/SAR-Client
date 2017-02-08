/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PouchService } from './pouch.service';

describe('PouchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PouchService]
    });
  });

  it('should ...', inject([PouchService], (service: PouchService) => {
    expect(service).toBeTruthy();
  }));
});
