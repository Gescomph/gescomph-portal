import { TestBed } from '@angular/core/testing';

import { ContractsRealtimeService } from '../../features/contracts/services/contract/contracts-realtime.service';

describe('ContractsRealtimeService', () => {
  let service: ContractsRealtimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContractsRealtimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
