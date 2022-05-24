import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApportionmentComponent } from './apportionment.component';

describe('ApportionmentComponent', () => {
  let component: ApportionmentComponent;
  let fixture: ComponentFixture<ApportionmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ApportionmentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApportionmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
