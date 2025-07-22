import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

// API Response interfaces
export interface ApiResponse {
  status: number;
  message: string;
  result: any;
}

export interface Level0Response extends ApiResponse {
  result: string;
}

export interface Level1Response {
  patient_ids: string;
}

export interface CleanupResponse {
  patient_ids: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Level 0 API - GET with optional query parameter
  getLevel0(patientIds?: string): Observable<Level0Response> {
    let params = new HttpParams();
    if (patientIds) {
      params = params.set('patient_ids_request', patientIds);
    }
    
    return this.http.get<Level0Response>(`${this.baseUrl}/level0/level0`, { params });
  }

  // Level 1 API - GET with query parameter
  getLevel1(patientIds: string): Observable<Level1Response> {
    const params = new HttpParams().set('patient_ids_request', patientIds);
    return this.http.get<Level1Response>(`${this.baseUrl}/level1/level1`, { params });
  }

  // Cleanup API - GET with query parameter
  getCleanup(patientIds: string): Observable<CleanupResponse> {
    const params = new HttpParams().set('patient_ids_request', patientIds);
    return this.http.get<CleanupResponse>(`${this.baseUrl}/cleanup/cleanup`, { params });
  }
} 