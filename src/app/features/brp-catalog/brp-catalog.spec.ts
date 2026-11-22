import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrpCatalog } from './brp-catalog';

describe('BrpCatalog', () => {
  let component: BrpCatalog;
  let fixture: ComponentFixture<BrpCatalog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrpCatalog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrpCatalog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
