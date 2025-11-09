import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { HasRoleAndPermissionDirective } from '../../../../core/security/directives/has-role-and-permission.directive';

@Component({
  selector: 'app-button',
  imports: [HasRoleAndPermissionDirective, CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() showView = true;
  @Input() showEdit = true;
  @Input() showDelete = true;
  @Input() showCreateAppointment = true;


  @Output() view = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();
  @Output() createAppointment = new EventEmitter<void>();

  handleView(): void {
    this.view.emit();
  }

  handleEdit(): void {
    this.edit.emit();
  }

  handleDelete(): void {
    this.delete.emit();
  }

  handleCreateAppointment(): void {
    this.createAppointment.emit();
  }
}
