import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegifacturaComponent } from './regifactura.component';

describe('RegifacturaComponent', () => {
  let component: RegifacturaComponent;
  let fixture: ComponentFixture<RegifacturaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegifacturaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegifacturaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
