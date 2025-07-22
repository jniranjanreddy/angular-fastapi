import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogReaderComponent } from './log-reader.component';

describe('LogReaderComponent', () => {
  let component: LogReaderComponent;
  let fixture: ComponentFixture<LogReaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogReaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
