import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card'; // ¡Importa MatCardModule!


@Component({
  selector: 'app-age-confirmation-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatCardModule], // Asegúrate de importar MatButtonModule aquí
  templateUrl: './age-confirmation-dialog.component.html',
  styleUrl: './age-confirmation-dialog.component.css'
})
export class AgeConfirmationDialogComponent {
  constructor(public dialogRef: MatDialogRef<AgeConfirmationDialogComponent>) { }


  onYesClick(): void {
    this.dialogRef.close(true); // Cierra el diálogo pasando 'true'
  }
}
