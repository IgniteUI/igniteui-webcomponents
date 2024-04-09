import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NorthwindCloudService } from './northwind-cloud.service';

describe('NorthwindCloudService', () => {
  let service: NorthwindCloudService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });
    service = TestBed.inject(NorthwindCloudService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
