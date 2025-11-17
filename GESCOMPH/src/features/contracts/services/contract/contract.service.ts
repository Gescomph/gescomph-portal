import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import {
  ContractCreateModel,
  ContractPublicMetricsDto,
  ContractSelectModel,
} from '../../models/contract.models';

import { AuthGenericService } from '../../../../core/services/generic/auth-generic.service';
import { MonthlyObligation } from '../../models/obligation-month.models';

@Injectable({ providedIn: 'root' })
export class ContractService
  extends AuthGenericService<ContractSelectModel, ContractCreateModel, Partial<ContractCreateModel>> {
  protected override resource = 'contract';

  // aquí sí override - porque es /mine no /
  override getAll(): Observable<ContractSelectModel[]> {
    const params = new HttpParams().set('_ts', Date.now());
    return this.http.get<ContractSelectModel[]>(
      this.url('mine'),
      { headers: this.authedHeaders, params }
    );
  }

  // si quieres mantener el _ts -> override
  override getById(id: number): Observable<ContractSelectModel> {
    const params = new HttpParams().set('_ts', Date.now());
    return this.http.get<ContractSelectModel>(
      this.url(id),
      { params, headers: this.authedHeaders }
    );
  }

  override create(payload: ContractCreateModel): Observable<ContractSelectModel> {
    return this.http.post<ContractSelectModel>(
      this.url(),
      payload,
      { headers: this.authedHeaders }
    );
  }



  // el resto solo si realmente tu ruta no es igual a la del padre

  getPublicMetrics(): Observable<ContractPublicMetricsDto> {
    return this.http.get<ContractPublicMetricsDto>(
      this.url('metrics'),
      { headers: this.authedHeaders }
    );
  }

  downloadContractPdf(id: number): Observable<Blob> {
    const params = new HttpParams().set('_ts', Date.now());
    return this.http.get(
      this.url(id, 'pdf'),
      { responseType: 'blob' as 'blob', params, headers: this.authedHeaders }
    );
  }

  getMonthlyObligations(contractId: number): Observable<MonthlyObligation[]> {
    const params = new HttpParams().set('_ts', Date.now());
    return this.http.get<MonthlyObligation[]>(
      this.url(contractId, 'obligations'),
      { params, headers: this.authedHeaders }
    );
  }
}
