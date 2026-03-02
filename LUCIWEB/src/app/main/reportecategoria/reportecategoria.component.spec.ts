import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportecategoriaComponent } from './reportecategoria.component';

describe('ReportecategoriaComponent', () => {
  let component: ReportecategoriaComponent;
  let fixture: ComponentFixture<ReportecategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportecategoriaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportecategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
