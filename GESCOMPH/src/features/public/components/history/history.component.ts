import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { CarruselComponent } from '../carrusel/carrusel.component';

@Component({
  selector: 'app-history',
  imports: [CarruselComponent, MatIconModule],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent {

}
