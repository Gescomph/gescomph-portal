import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-terms-content',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
  ],
  templateUrl: './terms-content.component.html',
  styleUrl: './terms-content.component.css'
})
export class TermsContentComponent {
  // Component for displaying terms and conditions content
}
