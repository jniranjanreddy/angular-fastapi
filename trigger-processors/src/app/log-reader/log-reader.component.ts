import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { L1ProcessorResponse } from '../services/l1-processor.service';
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

    this.apiService.processL1(this.l1PatientId).subscribe({
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

    this.apiService.processL3(this.l3PatientId).subscribe({
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

    this.apiService.processCleanup(this.cleanupPatientId).subscribe({
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
}
