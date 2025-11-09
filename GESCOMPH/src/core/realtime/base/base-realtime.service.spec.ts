import { TestBed } from '@angular/core/testing';

import { BaseRealtimeService } from './base-realtime.service';

describe('BaseRealtimeService', () => {
  let service: BaseRealtimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BaseRealtimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
