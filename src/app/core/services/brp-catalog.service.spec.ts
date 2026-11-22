import { TestBed } from '@angular/core/testing';
import { BrpCatalog } from '../../features/brp-catalog/brp-catalog';

describe('BrpCatalog', () => {
  let service: BrpCatalog;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrpCatalog);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
