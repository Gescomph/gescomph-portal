import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { GenericTableComponent } from '../../../../../shared/components/feedback/generic-table/generic-table.component';
import { ToggleButtonComponent } from '../../../../../shared/components/ui/toggle-button/toggle-button-component.component';
import { HasRoleAndPermissionDirective } from '../../../../../core/security/directives/has-role-and-permission.directive';

import { SweetAlertService } from '../../../../../shared/utils/notifications/sweet-alert.service';
import { PageHeaderService } from '../../../../../shared/services/page-header/page-header.service';

import { TableColumn } from '../../../../../shared/models/table-column.models';

import { UserSelectModel } from '../../../models/user.models';

import { SecurityUserStore } from '../../../store/user/user.store';
import { firstValueFrom } from 'rxjs';
import { SECURITY_USERS_TOUR } from './security-users-tour';
import { DriverJsService } from '../../../../../shared/services/driver/driver-js.services';

@Component({
  selector: 'app-user-list',
  imports: [
    CommonModule,
    GenericTableComponent,
    MatSlideToggleModule,
    ToggleButtonComponent,
    HasRoleAndPermissionDirective,
    MatProgressSpinnerModule
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  private readonly dialog = inject(MatDialog);
  private readonly alerts = inject(SweetAlertService);
  private readonly pageHeader = inject(PageHeaderService);
  private readonly driverJs = inject(DriverJsService);

  private readonly userStore = inject(SecurityUserStore);

  readonly users$ = this.userStore.users$;

  columns: TableColumn<UserSelectModel>[] = [];

  @ViewChild('userTemplate', { static: true }) userTemplate!: TemplateRef<unknown>;
  @ViewChild('estadoTemplate', { static: true }) estadoTemplate!: TemplateRef<unknown>;

  ngOnInit(): void {
    this.pageHeader.setPageHeader('Usuarios', 'Gestión de Usuarios');
    this.driverJs.registerSteps('security/users', SECURITY_USERS_TOUR);

    this.columns = [
      { key: 'email', header: 'Usuario', template: this.userTemplate },
      { key: 'personDocument', header: 'N° Documento' },
      { key: 'personPhone', header: 'Teléfono' },
      { key: 'personAddress', header: 'Dirección' },
      { key: 'cityName', header: 'Ciudad' },
      { key: 'roles', header: 'Rol', render: r => r.roles?.join(', ') || '' },
      { key: 'active', header: 'Estado', template: this.estadoTemplate }
    ];
  }

  async onCreate(): Promise<void> {
    const { UserFormDialogComponent } = await import('../../../components/user-form-dialog/user-form-dialog.component');

    this.dialog.open(UserFormDialogComponent, {
      width: '720px',
      data: { mode: 'create' },
      disableClose: true
    });
  }

  async onEdit(row: UserSelectModel): Promise<void> {
    const { UserFormDialogComponent } = await import('../../../components/user-form-dialog/user-form-dialog.component');

    this.dialog.open(UserFormDialogComponent, {
      width: '720px',
      data: { mode: 'edit', user: row },
      disableClose: true
    });
  }

  async onDelete(row: UserSelectModel): Promise<void> {
    const res = await this.alerts.showConfirm(
      'Eliminar usuario',
      `¿Eliminar a "${row.personName}"?`,
      'Eliminar',
      'Cancelar',
      'warning'
    );

    if (!res.isConfirmed) return;

    try {
      await firstValueFrom(this.userStore.deleteLogicFull(row.id));
      this.alerts.showNotification('Eliminado', 'Usuario eliminado correctamente.', 'success');
    } catch (err) {
      this.alerts.showApiError(err);
    }
  }

  async onToggleActive(id: number | null, e: any): Promise<void> {
    if (!id) {
      this.alerts.showNotification('Sin ID', 'No se encontró el usuario.', 'warning');
      return;
    }

    const active = typeof e === 'boolean' ? e : !!e?.checked;

    try {
      await firstValueFrom(this.userStore.changeActiveStatus(id, active));
      this.alerts.showNotification(
        'Éxito',
        `Usuario ${active ? 'activado' : 'desactivado'} correctamente.`,
        'success'
      );
    } catch (err) {
      this.alerts.showApiError(err);
    }
  }

  trackById(_: number, item: UserSelectModel) {
    return item.id;
  }
}
