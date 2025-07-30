import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LogFile {
  filename: string;
  date: string;
  patient_id: string;
  file_path: string;
  file_size: number;
  full_path: string;
}

export interface L1ProcessorResponse {
  level: number;
  status: number;
  message: string;
  result: string;
  patient_ids: string[];
  log_files: LogFile[];
}

export interface PatientIDsRequest {
  patient_ids: string[];
}

@Injectable({
  providedIn: 'root'
})
export class L1ProcessorService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Process patient IDs through L1 processor
   * @param patientIds - Array of patient IDs to process
   * @returns Observable with L1 processor response
   */
  processL1(patientIds: string[]): Observable<L1ProcessorResponse> {
    const requestBody: PatientIDsRequest = {
      patient_ids: patientIds
    };
    return this.http.post<L1ProcessorResponse>(`${this.baseUrl}/level1/level1`, requestBody);
  }

  /**
   * Process a single patient ID through L1 processor
   * @param patientId - Single patient ID to process
   * @returns Observable with L1 processor response
   */
  processL1Single(patientId: string): Observable<L1ProcessorResponse> {
    return this.processL1([patientId]);
  }

  /**
   * Process patient IDs through L1 processor with optional parameter (legacy method)
   * @param patientIds - Optional patient IDs to process
   * @returns Observable with L1 processor response
   */
  processL1Optional(patientIds?: string): Observable<L1ProcessorResponse> {
    if (patientIds) {
      return this.processL1([patientIds]);
    } else {
      return this.processL1([]);
    }
  }

  /**
   * Read the content of a specific log file
   * @param date - Date directory
   * @param filename - Log file name
   * @returns Observable with log file content
   */
  readLogFile(date: string, filename: string): Observable<{filename: string; date: string; content: string; file_size: number}> {
    return this.http.get<{filename: string; date: string; content: string; file_size: number}>(`${this.baseUrl}/level1/log-file/${date}/${filename}`);
  }
} 