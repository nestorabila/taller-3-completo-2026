import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportefacturacionComponent } from './reportefacturacion.component';

describe('ReportefacturacionComponent', () => {
  let component: ReportefacturacionComponent;
  let fixture: ComponentFixture<ReportefacturacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportefacturacionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportefacturacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
