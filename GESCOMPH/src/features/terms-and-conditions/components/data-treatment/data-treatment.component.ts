import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-data-treatment',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
  ],
  templateUrl: './data-treatment.component.html',
  styleUrl: './data-treatment.component.css'
})
export class DataTreatmentComponent {
  // Component for displaying personal data treatment authorization
}
