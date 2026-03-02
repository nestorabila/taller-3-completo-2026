import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportelibreriaComponent } from './reportelibreria.component';

describe('ReportelibreriaComponent', () => {
  let component: ReportelibreriaComponent;
  let fixture: ComponentFixture<ReportelibreriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportelibreriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportelibreriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
