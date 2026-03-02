import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteproductoComponent } from './reporteproducto.component';

describe('ReporteproductoComponent', () => {
  let component: ReporteproductoComponent;
  let fixture: ComponentFixture<ReporteproductoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteproductoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteproductoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
