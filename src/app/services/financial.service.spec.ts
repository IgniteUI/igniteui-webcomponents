import { TestBed } from '@angular/core/testing';

import { FinancialService } from './financial.service';

describe('FinancialService', () => {
  let service: FinancialService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FinancialService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
