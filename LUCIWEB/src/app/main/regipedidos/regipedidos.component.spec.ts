import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegipedidosComponent } from './regipedidos.component';

describe('RegipedidosComponent', () => {
  let component: RegipedidosComponent;
  let fixture: ComponentFixture<RegipedidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegipedidosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegipedidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
