import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderService } from '../../../../shared/services/page-header/page-header.service';
import { TermsContentComponent } from '../terms-content/terms-content.component';
import { DataTreatmentComponent } from '../data-treatment/data-treatment.component';

@Component({
  selector: 'app-terms-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
  ],
  templateUrl: './terms-modal.component.html',
  styleUrl: './terms-modal.component.css',
  encapsulation: ViewEncapsulation.None,
})

export class TermsModalComponent implements OnInit {
  private readonly pageHeaderService = inject(PageHeaderService);
  private readonly dialogRef = inject(MatDialogRef<TermsModalComponent>);

  visibleTabs: { label: string; description: string; component: any }[] = [];

  ngOnInit(): void {
    const allTabs = [
      {
        label: 'Términos y Condiciones',
        description: 'Términos y condiciones de uso del servicio',
        component: TermsContentComponent,
      },
      {
        label: 'Tratamiento de Datos Personales',
        description: 'Autorización para el tratamiento de datos personales',
        component: DataTreatmentComponent,
      },
    ];

    this.visibleTabs = allTabs;
  }

  onTabChange(index: number): void {
    const tab = this.visibleTabs[index];
    if (tab) {
      this.pageHeaderService.setPageHeader(tab.label, tab.description);
    }
  }

  acceptTerms(): void {
    this.dialogRef.close(true);
  }

  close(): void {
    this.dialogRef.close(false);
  }
}
