import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReginsumoComponent } from './reginsumo.component';

describe('ReginsumoComponent', () => {
  let component: ReginsumoComponent;
  let fixture: ComponentFixture<ReginsumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReginsumoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReginsumoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
