import { Routes } from "@angular/router";
import { ContractsListComponent } from "./pages/contracts-list/contracts-list.component";
import { ClausesListComponent } from "./pages/clauses-list/clauses-list.component";

export const CONTRACTS_ROUTES: Routes = [
  { path: '', component: ContractsListComponent },
  { path: 'clauses', component: ClausesListComponent, title: 'Cláusulas' }
];
