import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MenuDeroulantComponent } from './components/menu-deroulant/menu-deroulant.component';
import { MatDialog } from '@angular/material/dialog';
import { AgeConfirmationDialogComponent } from './dialogs/age-confirmation-dialog/age-confirmation-dialog.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MenuDeroulantComponent, MatCardModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'asistmedic';
  logoSrc: string = 'assets/logo.jpg';
  logoUssSrc: string = 'assets/logo-uss-vm.jpg';

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
    this.openAgeConfirmationDialog();
  }
  openAgeConfirmationDialog(): void {
    const dialogRef = this.dialog.open(AgeConfirmationDialogComponent, {
      width: '480px', // Un ancho adecuado para la tarjeta
      disableClose: true,
      panelClass: 'age-confirmation-dialog-panel' // Clase para estilos globales del contenedor del diálogo
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('El diálogo se cerró. Resultado:', result);
      if (result) {
        console.log('El usuario confirmó ser mayor de edad.');
      } else {
        console.log('El usuario no confirmó ser mayor de edad o cerró el diálogo con "No".');
      }
    });
  }
}

