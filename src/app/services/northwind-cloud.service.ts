import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/northwind-cloud/category';

const API_ENDPOINT = 'https://northwindcloud.azurewebsites.net';

@Injectable({
  providedIn: 'root'
})
export class NorthwindCloudService {
  constructor(
    private http: HttpClient
  ) { }

  public getCategoryList(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_ENDPOINT}/api/categories`);
  }
}
