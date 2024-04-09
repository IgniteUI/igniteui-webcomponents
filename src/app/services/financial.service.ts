import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Financial } from '../static-data/financial';

@Injectable({
  providedIn: 'root'
})
export class FinancialService {
  public getData(tableName: string): Observable<any> {
    return of(Financial[tableName]);
  }
}
