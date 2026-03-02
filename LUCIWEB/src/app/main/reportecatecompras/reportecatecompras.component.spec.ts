import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportecatecomprasComponent } from './reportecatecompras.component';

describe('ReportecatecomprasComponent', () => {
  let component: ReportecatecomprasComponent;
  let fixture: ComponentFixture<ReportecatecomprasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportecatecomprasComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReportecatecomprasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
