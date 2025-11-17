import { Routes } from "@angular/router";
import { LoginComponent } from "./pages/login/login.component";
import { ResetPasswordComponent } from "./pages/reset-password/reset-password.component";
import { ConfirmResetPasswordComponent } from "./pages/confirm-reset/confirm-reset-password.component";
import { TwoFactorComponent } from "./pages/two-factor/two-factor.component";

export const AUTH_ROUTES: Routes = [
    { path: 'login', component: LoginComponent },
    { path: 'two-factor', component: TwoFactorComponent },
    { path: 'password_reset', component: ResetPasswordComponent},
    { path: 'password_reset/confirm', component: ConfirmResetPasswordComponent},


    { path: '**', redirectTo: 'login' }
]
