import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportecatepedidosComponent } from './reportecatepedidos.component';

describe('ReportecatepedidosComponent', () => {
  let component: ReportecatepedidosComponent;
  let fixture: ComponentFixture<ReportecatepedidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportecatepedidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportecatepedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
