import { TestBed } from '@angular/core/testing';

import { EstablishmentEventsService  } from './establishment-events.service';

describe('EstablishmentEventsService ', () => {
  let service: EstablishmentEventsService ;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EstablishmentEventsService );
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
