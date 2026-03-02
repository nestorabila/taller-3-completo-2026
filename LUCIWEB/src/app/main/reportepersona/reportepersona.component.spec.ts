import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportepersonaComponent } from './reportepersona.component';

describe('ReportepersonaComponent', () => {
  let component: ReportepersonaComponent;
  let fixture: ComponentFixture<ReportepersonaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportepersonaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportepersonaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
