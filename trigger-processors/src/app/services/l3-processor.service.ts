import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface L3ProcessorResponse {
  level: number;
  status: number;
  message: string;
  result: string;
}

@Injectable({
  providedIn: 'root'
})
export class L3ProcessorService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Process patient IDs through L3 processor
   * @param patientIds - Patient IDs to process
   * @returns Observable with L3 processor response
   */
  processL3(patientIds: string): Observable<L3ProcessorResponse> {
    const params = new HttpParams().set('patient_ids_request', patientIds);
    return this.http.get<L3ProcessorResponse>(`${this.baseUrl}/level3/level3`, { params });
  }
} 