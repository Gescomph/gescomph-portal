import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { FormType } from '../generic-form/generic-form.config';
import { CommonModule } from '@angular/common';
import { StandardButtonComponent } from '../../ui/standard-button/standard-button.component';
import { GenericFormComponent } from '../generic-form/generic-form.component';

@Component({
  selector: 'app-form-dialog',
  imports: [GenericFormComponent, MatDialogTitle, MatDialogActions, MatDialogModule, MatButtonModule, CommonModule, StandardButtonComponent],
  templateUrl: './form-dialog.component.html',
  styleUrls: ['./form-dialog.component.css']
})
export class FormDialogComponent implements OnInit {

  @ViewChild('dynamicForm') dynamicForm!: GenericFormComponent;
  dialogTitle: string = '';

  constructor(
    public dialogRef: MatDialogRef<FormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { entity: any; formType: FormType; title: string; selectOptions?: Record<string, any[]> }
  ) { }

  ngOnInit(): void {
    const operation = this.data.entity && this.data.entity.id ? 'Editar' : 'Crear';
    this.dialogTitle = `${operation} ${this.data.formType}`;
  }

  close(data: any): void {
    this.dialogRef.close(data);
  }
}
