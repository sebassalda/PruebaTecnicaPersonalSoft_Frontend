import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrpDetail } from './brp-detail';

describe('BrpDetail', () => {
  let component: BrpDetail;
  let fixture: ComponentFixture<BrpDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrpDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BrpDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
