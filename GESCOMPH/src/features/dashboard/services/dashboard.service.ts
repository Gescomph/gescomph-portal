import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { ChartObligationsMonths } from '../../contracts/models/obligation-month.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private readonly http = inject(HttpClient);

  private urlEstablishments = environment.apiURL + '/Establishments';
  private urlObligation = environment.apiURL + '/obligation-months';

  getLastSixMonthsPaid() {
    return this.http.get<ChartObligationsMonths[]>(`${this.urlObligation}/LastSixMonthsPaid`);
  }

}
