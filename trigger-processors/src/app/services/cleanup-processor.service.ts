import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CleanupProcessorResponse {
  level: string;
  status: number;
  message: string;
  result: string;
  logs: string[];
  log_count: number;
}

@Injectable({
  providedIn: 'root'
})
export class CleanupProcessorService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Process patient IDs through Cleanup processor
   * @param patientIds - Patient IDs to process
   * @returns Observable with Cleanup processor response
   */
  processCleanup(patientIds: string): Observable<CleanupProcessorResponse> {
    const params = new HttpParams().set('patient_ids_request', patientIds);
    return this.http.get<CleanupProcessorResponse>(`${this.baseUrl}/cleanup/cleanup`, { params });
  }
} 