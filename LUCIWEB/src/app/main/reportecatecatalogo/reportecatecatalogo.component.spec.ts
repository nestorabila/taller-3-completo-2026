import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportecatecatalogoComponent } from './reportecatecatalogo.component';

describe('ReportecatecatalogoComponent', () => {
  let component: ReportecatecatalogoComponent;
  let fixture: ComponentFixture<ReportecatecatalogoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportecatecatalogoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportecatecatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
