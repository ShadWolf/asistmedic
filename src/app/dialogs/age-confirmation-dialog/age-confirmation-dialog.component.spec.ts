// age-confirmation-dialog.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgeConfirmationDialogComponent } from './age-confirmation-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations'; // Necesario para componentes de Material

describe('AgeConfirmationDialogComponent', () => {
  let component: AgeConfirmationDialogComponent;
  let fixture: ComponentFixture<AgeConfirmationDialogComponent>;
  let mockMatDialogRef: jasmine.SpyObj<MatDialogRef<AgeConfirmationDialogComponent>>;

  beforeEach(async () => {
    // Creamos un mock para MatDialogRef usando jasmine.createSpyObj
    // Esto nos permite espiar y verificar las llamadas a sus métodos.
    mockMatDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        AgeConfirmationDialogComponent, // Importa el componente standalone
        NoopAnimationsModule // Importa para manejar las animaciones de Material
      ],
      providers: [
        // Proporciona nuestro mock para MatDialogRef
        { provide: MatDialogRef, useValue: mockMatDialogRef }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgeConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // Detecta cambios para inicializar el componente y su template
  });

  it('debería crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debería llamar a dialogRef.close(true) cuando se llama a onYesClick', () => {
    // Llama al método onYesClick del componente
    component.onYesClick();

    // Verifica que el método 'close' del mock de MatDialogRef haya sido llamado
    // y que haya sido llamado con el valor 'true'
    expect(mockMatDialogRef.close).toHaveBeenCalledWith(true);
  });

  // Puedes añadir más tests si tu HTML tiene elementos interactivos
  // Por ejemplo, si tuvieras un botón "Sí" en el template:
  it('debería llamar a onYesClick y cerrar el diálogo al hacer clic en el botón "Sí, soy mayor de edad"', () => {
    // Espía el método onYesClick del componente para verificar si se invoca
    spyOn(component, 'onYesClick').and.callThrough(); // .and.callThrough() permite que el método original se ejecute también

    // Encuentra el botón por su texto o por su atributo mat-raised-button
    // Es mejor usar un selector más específico si hay varios botones,
    // pero en este caso, el texto es único.
    const yesButton = fixture.nativeElement.querySelector('button[mat-raised-button]');

    // Verifica que el botón exista antes de intentar hacer clic
    expect(yesButton).toBeTruthy('El botón "Sí, soy mayor de edad" no fue encontrado.');

    // Simula un clic en el botón
    yesButton.click();

    // Verifica que el método onYesClick del componente fue llamado
    expect(component.onYesClick).toHaveBeenCalled();

    // Verifica que el método close del mock de MatDialogRef fue llamado con 'true'
    expect(mockMatDialogRef.close).toHaveBeenCalledWith(true);
  });
});
