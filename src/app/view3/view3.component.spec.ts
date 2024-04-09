import { ComponentFixture, TestBed } from '@angular/core/testing';

import { View3Component } from './view3.component';

describe('View3Component', () => {
  let component: View3Component;
  let fixture: ComponentFixture<View3Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [View3Component]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(View3Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
