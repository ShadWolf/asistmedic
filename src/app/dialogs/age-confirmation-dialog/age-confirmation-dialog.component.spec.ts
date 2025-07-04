import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgeConfirmationDialogComponent } from './age-confirmation-dialog.component';

describe('AgeConfirmationDialogComponent', () => {
  let component: AgeConfirmationDialogComponent;
  let fixture: ComponentFixture<AgeConfirmationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgeConfirmationDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgeConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
