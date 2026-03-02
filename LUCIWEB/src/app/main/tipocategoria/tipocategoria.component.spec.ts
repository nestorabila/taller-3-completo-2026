import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipocategoriaComponent } from './tipocategoria.component';

describe('TipocategoriaComponent', () => {
  let component: TipocategoriaComponent;
  let fixture: ComponentFixture<TipocategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipocategoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipocategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
