import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { L1ProcessorService, L1ProcessorResponse } from './l1-processor.service';
import { L3ProcessorService, L3ProcessorResponse } from './l3-processor.service';
import { CleanupProcessorService, CleanupProcessorResponse } from './cleanup-processor.service';

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

  constructor(
    private http: HttpClient,
    private l1Processor: L1ProcessorService,
    private l3Processor: L3ProcessorService,
    private cleanupProcessor: CleanupProcessorService
  ) { }

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

  // L1 Processor Integration - Updated to use array of patient IDs
  processL1(patientIds: string[]): Observable<L1ProcessorResponse> {
    return this.l1Processor.processL1(patientIds);
  }

  // L1 Processor Integration - Single patient ID
  processL1Single(patientId: string): Observable<L1ProcessorResponse> {
    return this.l1Processor.processL1Single(patientId);
  }

  processL1Optional(patientIds?: string): Observable<L1ProcessorResponse> {
    return this.l1Processor.processL1Optional(patientIds);
  }

  // L3 Processor Integration
  processL3(patientIds: string): Observable<L3ProcessorResponse> {
    return this.l3Processor.processL3(patientIds);
  }

  // Cleanup Processor Integration
  processCleanup(patientIds: string): Observable<CleanupProcessorResponse> {
    return this.cleanupProcessor.processCleanup(patientIds);
  }

  // Log File Reading
  readLogFile(date: string, filename: string): Observable<{filename: string; date: string; content: string; file_size: number}> {
    return this.l1Processor.readLogFile(date, filename);
  }
} 