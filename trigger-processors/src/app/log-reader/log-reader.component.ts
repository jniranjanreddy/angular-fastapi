import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { L1ProcessorResponse, LogFile } from '../services/l1-processor.service';
import { L3ProcessorResponse } from '../services/l3-processor.service';
import { CleanupProcessorResponse } from '../services/cleanup-processor.service';

@Component({
  selector: 'app-log-reader',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './log-reader.component.html',
  styleUrl: './log-reader.component.css'
})
export class LogReaderComponent {
  // Search inputs for each section
  l1PatientId: string = '';
  l3PatientId: string = '';
  cleanupPatientId: string = '';

  // Active tab tracking
  activeTab: string = 'l1';

  // Response data
  l1Response: L1ProcessorResponse | null = null;
  l3Response: L3ProcessorResponse | null = null;
  cleanupResponse: CleanupProcessorResponse | null = null;

  // File viewer properties
  selectedFile: LogFile | null = null;
  fileContent: string | null = null;

  // Log parsing helper
  parseLogLine(logLine: string): { timestamp: string; level: string; message: string } {
    try {
      // Expected format: "2024-01-15 08:30:15 [INFO] L1 Processor started..."
      const match = logLine.match(/^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[(\w+)\] (.+)$/);
      
      if (match) {
        return {
          timestamp: match[1],
          level: match[2],
          message: match[3]
        };
      } else {
        return {
          timestamp: '',
          level: 'UNKNOWN',
          message: logLine
        };
      }
    } catch (error) {
      return {
        timestamp: '',
        level: 'ERROR',
        message: logLine
      };
    }
  }

  // Loading states
  l1Loading: boolean = false;
  l3Loading: boolean = false;
  cleanupLoading: boolean = false;

  // Error states
  l1Error: string | null = null;
  l3Error: string | null = null;
  cleanupError: string | null = null;

  constructor(private apiService: ApiService) {}

  // L1 Processor Search
  onL1Search(): void {
    if (!this.l1PatientId.trim()) {
      this.l1Error = 'Please enter a Patient ID';
      return;
    }

    this.l1Loading = true;
    this.l1Error = null;
    this.l1Response = null;

    // Split the input by commas and trim whitespace from each ID
    const patientIds = this.l1PatientId
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    this.apiService.processL1(patientIds).subscribe({
      next: (response) => {
        this.l1Response = response;
        this.l1Loading = false;
        console.log('L1 Processor Response:', response);
      },
      error: (error) => {
        this.l1Error = 'Error processing L1 request: ' + error.message;
        this.l1Loading = false;
        console.error('L1 Processor Error:', error);
      }
    });
  }

  // L3 Processor Search
  onL3Search(): void {
    if (!this.l3PatientId.trim()) {
      this.l3Error = 'Please enter a Patient ID';
      return;
    }

    this.l3Loading = true;
    this.l3Error = null;
    this.l3Response = null;

    // Split the input by commas and trim whitespace from each ID
    const patientIds = this.l3PatientId
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    // For L3, we'll process the first patient ID (assuming single patient processing)
    const firstPatientId = patientIds[0];
    this.apiService.processL3(firstPatientId).subscribe({
      next: (response) => {
        this.l3Response = response;
        this.l3Loading = false;
        console.log('L3 Processor Response:', response);
      },
      error: (error) => {
        this.l3Error = 'Error processing L3 request: ' + error.message;
        this.l3Loading = false;
        console.error('L3 Processor Error:', error);
      }
    });
  }

  // Cleanup Processor Search
  onCleanupSearch(): void {
    if (!this.cleanupPatientId.trim()) {
      this.cleanupError = 'Please enter a Patient ID';
      return;
    }

    this.cleanupLoading = true;
    this.cleanupError = null;
    this.cleanupResponse = null;

    // Split the input by commas and trim whitespace from each ID
    const patientIds = this.cleanupPatientId
      .split(',')
      .map(id => id.trim())
      .filter(id => id.length > 0);

    // For Cleanup, we'll process the first patient ID (assuming single patient processing)
    const firstPatientId = patientIds[0];
    this.apiService.processCleanup(firstPatientId).subscribe({
      next: (response) => {
        this.cleanupResponse = response;
        this.cleanupLoading = false;
        console.log('Cleanup Processor Response:', response);
      },
      error: (error) => {
        this.cleanupError = 'Error processing Cleanup request: ' + error.message;
        this.cleanupLoading = false;
        console.error('Cleanup Processor Error:', error);
      }
    });
  }

  // Tab switching method
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Helper method to check if response is successful
  isSuccess(response: any): boolean {
    return response && response.status === 1;
  }

  // File viewer methods
  selectFile(file: LogFile): void {
    this.selectedFile = file;
    this.loadFileContent(file);
  }

  closeFile(): void {
    this.selectedFile = null;
    this.fileContent = null;
  }

  loadFileContent(file: LogFile): void {
    this.apiService.readLogFile(file.date, file.filename).subscribe({
      next: (response) => {
        this.fileContent = response.content;
      },
      error: (error) => {
        console.error('Error loading file content:', error);
        this.fileContent = 'Error loading file content';
      }
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
