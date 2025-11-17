  import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  PersonSelectModel,
  PersonCreateModel,
  PersonUpdateModel
} from '../../models/person.models';
import { AuthGenericService } from '../../../../core/services/generic/auth-generic.service';

@Injectable({
  providedIn: 'root'
})
export class PersonService
  extends AuthGenericService<PersonSelectModel, PersonCreateModel, PersonUpdateModel>
{
  protected override resource = 'person';

  getByDocument(document: string): Observable<PersonSelectModel | null> {
    return this.http.get<PersonSelectModel | null>(
      this.url('document', document),
      { headers: this.authedHeaders }
    );
  }
}
