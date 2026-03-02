import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiinsumoComponent } from './liinsumo.component';

describe('LiinsumoComponent', () => {
  let component: LiinsumoComponent;
  let fixture: ComponentFixture<LiinsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiinsumoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiinsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
