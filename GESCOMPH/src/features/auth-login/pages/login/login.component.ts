import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SweetAlertService } from '../../../../shared/utils/notifications/sweet-alert.service';
import { AuthService } from '../../../../core/security/auth/auth.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private sweetAlertService = inject(SweetAlertService);

  passwordVisible = false;

  readonly errorMessages = {
    email: {
      required: 'El correo es obligatorio.',
      email: 'Ingresa un correo válido (ej. usuario@dominio.com).',
      maxlength: 'El correo no puede superar 254 caracteres.',
    },
    password: {
      required: 'La contraseña es obligatoria.',
      minlength: 'La contraseña debe tener al menos 6 caracteres.',
      maxlength: 'La contraseña no puede superar 128 caracteres.'
    }
  } as const;

  formLogin: FormGroup = this.fb.nonNullable.group({
    email: this.fb.nonNullable.control<string>('', {
      validators: [
        Validators.required,
        Validators.email,
        Validators.maxLength(254)
      ],
      updateOn: 'blur'
    }),
    password: this.fb.nonNullable.control<string>('', {
      validators: [
        Validators.required,
        Validators.minLength(6),
        Validators.maxLength(128)
      ],
      updateOn: 'change'
    })
  });

  get emailCtrl() { return this.formLogin.get('email')!; }
  get passwordCtrl() { return this.formLogin.get('password')!; }

  isInvalid(control: AbstractControl | null): boolean {
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  firstErrorOf(controlName: 'email' | 'password'): string | null {
    const ctrl = this.formLogin.get(controlName);
    if (!ctrl || !ctrl.errors) return null;
    const map = this.errorMessages[controlName];
    for (const key of Object.keys(ctrl.errors)) {
      if ((map as any)[key]) return (map as any)[key];
    }
    return 'Valor inválido.';
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  login(): void {
    if (this.formLogin.invalid) {
      this.formLogin.markAllAsTouched();
      return;
    }

    this.sweetAlertService.showLoading('Iniciando sesión', 'Por favor, espere...');

    this.auth.Login(this.formLogin.value).subscribe({
      next: () => {
        this.sweetAlertService.hideLoading();
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.sweetAlertService.hideLoading();
        this.sweetAlertService.showApiError(err);
      }
    });
  }
}
