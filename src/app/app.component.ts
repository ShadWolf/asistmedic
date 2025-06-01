import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MenuDeroulantComponent } from './components/menu-deroulant/menu-deroulant.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuDeroulantComponent, MatCardModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'asistmedic';
  logoSrc: string = 'assets/logo.jpg';
}
