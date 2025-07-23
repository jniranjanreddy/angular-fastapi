import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface L1ProcessorResponse {
  level: number;
  status: number;
  message: string;
  result: string;
}

@Injectable({
  providedIn: 'root'
})
export class L1ProcessorService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Process patient IDs through L1 processor
   * @param patientIds - Patient IDs to process
   * @returns Observable with L1 processor response
   */
  processL1(patientIds: string): Observable<L1ProcessorResponse> {
    const params = new HttpParams().set('patient_ids_request', patientIds);
    return this.http.get<L1ProcessorResponse>(`${this.baseUrl}/level1/level1`, { params });
  }

  /**
   * Process patient IDs through L1 processor with optional parameter
   * @param patientIds - Optional patient IDs to process
   * @returns Observable with L1 processor response
   */
  processL1Optional(patientIds?: string): Observable<L1ProcessorResponse> {
    let params = new HttpParams();
    if (patientIds) {
      params = params.set('patient_ids_request', patientIds);
    }
    return this.http.get<L1ProcessorResponse>(`${this.baseUrl}/level1/level1`, { params });
  }
} 