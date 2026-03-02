import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteproveedorComponent } from './reporteproveedor.component';

describe('ReporteproveedorComponent', () => {
  let component: ReporteproveedorComponent;
  let fixture: ComponentFixture<ReporteproveedorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteproveedorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteproveedorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
