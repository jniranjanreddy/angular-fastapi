import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Level0Response, Level1Response, CleanupResponse } from '../services/api.service';

@Component({
  selector: 'app-api-demo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>FastAPI Backend Integration Demo</h1>
      
      <!-- Level 0 API -->
      <div class="api-section">
        <h2>Level 0 API</h2>
        <div class="input-group">
          <input 
            type="text" 
            [(ngModel)]="level0Input" 
            placeholder="Enter patient IDs (optional)"
            class="form-input"
          >
          <button (click)="callLevel0()" class="btn btn-primary">Call Level 0</button>
        </div>
        <div *ngIf="level0Response" class="response">
          <h4>Response:</h4>
          <pre>{{ level0Response | json }}</pre>
        </div>
        <div *ngIf="level0Error" class="error">
          <h4>Error:</h4>
          <p>{{ level0Error }}</p>
        </div>
      </div>

      <!-- Level 1 API -->
      <div class="api-section">
        <h2>Level 1 API</h2>
        <div class="input-group">
          <input 
            type="text" 
            [(ngModel)]="level1Input" 
            placeholder="Enter patient IDs (required)"
            class="form-input"
          >
          <button (click)="callLevel1()" class="btn btn-primary">Call Level 1</button>
        </div>
        <div *ngIf="level1Response" class="response">
          <h4>Response:</h4>
          <pre>{{ level1Response | json }}</pre>
        </div>
        <div *ngIf="level1Error" class="error">
          <h4>Error:</h4>
          <p>{{ level1Error }}</p>
        </div>
      </div>

      <!-- Cleanup API -->
      <div class="api-section">
        <h2>Cleanup API</h2>
        <div class="input-group">
          <input 
            type="text" 
            [(ngModel)]="cleanupInput" 
            placeholder="Enter patient IDs (required)"
            class="form-input"
          >
          <button (click)="callCleanup()" class="btn btn-primary">Call Cleanup</button>
        </div>
        <div *ngIf="cleanupResponse" class="response">
          <h4>Response:</h4>
          <pre>{{ cleanupResponse | json }}</pre>
        </div>
        <div *ngIf="cleanupError" class="error">
          <h4>Error:</h4>
          <p>{{ cleanupError }}</p>
        </div>
      </div>

      <!-- Connection Status -->
      <div class="status-section">
        <h3>Backend Status</h3>
        <p>API Base URL: {{ apiService.baseUrl }}</p>
        <button (click)="testConnection()" class="btn btn-secondary">Test Connection</button>
        <div *ngIf="connectionStatus" class="status">
          <p [class.success]="connectionStatus.success" [class.error]="!connectionStatus.success">
            {{ connectionStatus.message }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }

    .api-section {
      margin-bottom: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }

    .input-group {
      display: flex;
      gap: 10px;
      margin-bottom: 15px;
    }

    .form-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      font-weight: bold;
    }

    .btn-primary {
      background-color: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background-color: #0056b3;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    .response {
      margin-top: 15px;
      padding: 15px;
      background-color: #d4edda;
      border: 1px solid #c3e6cb;
      border-radius: 4px;
    }

    .error {
      margin-top: 15px;
      padding: 15px;
      background-color: #f8d7da;
      border: 1px solid #f5c6cb;
      border-radius: 4px;
      color: #721c24;
    }

    .status-section {
      margin-top: 30px;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f8f9fa;
    }

    .status .success {
      color: #28a745;
    }

    .status .error {
      color: #dc3545;
    }

    pre {
      background-color: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
      overflow-x: auto;
    }

    h1 {
      color: #333;
      text-align: center;
      margin-bottom: 30px;
    }

    h2 {
      color: #495057;
      margin-bottom: 15px;
    }

    h3 {
      color: #495057;
      margin-bottom: 10px;
    }
  `]
})
export class ApiDemoComponent {
  level0Input: string = '';
  level1Input: string = '';
  cleanupInput: string = '';

  level0Response: Level0Response | null = null;
  level1Response: Level1Response | null = null;
  cleanupResponse: CleanupResponse | null = null;

  level0Error: string = '';
  level1Error: string = '';
  cleanupError: string = '';

  connectionStatus: { success: boolean; message: string } | null = null;

  constructor(public apiService: ApiService) {}

  callLevel0() {
    this.level0Error = '';
    this.level0Response = null;
    
    this.apiService.getLevel0(this.level0Input || undefined).subscribe({
      next: (response) => {
        this.level0Response = response;
      },
      error: (error) => {
        this.level0Error = `Error: ${error.message || 'Unknown error occurred'}`;
      }
    });
  }

  callLevel1() {
    if (!this.level1Input.trim()) {
      this.level1Error = 'Patient IDs are required for Level 1 API';
      return;
    }

    this.level1Error = '';
    this.level1Response = null;
    
    this.apiService.getLevel1(this.level1Input).subscribe({
      next: (response) => {
        this.level1Response = response;
      },
      error: (error) => {
        this.level1Error = `Error: ${error.message || 'Unknown error occurred'}`;
      }
    });
  }

  callCleanup() {
    if (!this.cleanupInput.trim()) {
      this.cleanupError = 'Patient IDs are required for Cleanup API';
      return;
    }

    this.cleanupError = '';
    this.cleanupResponse = null;
    
    this.apiService.getCleanup(this.cleanupInput).subscribe({
      next: (response) => {
        this.cleanupResponse = response;
      },
      error: (error) => {
        this.cleanupError = `Error: ${error.message || 'Unknown error occurred'}`;
      }
    });
  }

  testConnection() {
    this.connectionStatus = null;
    
    // Test with a simple call to level0 without parameters
    this.apiService.getLevel0().subscribe({
      next: (response) => {
        this.connectionStatus = {
          success: true,
          message: 'Backend connection successful!'
        };
      },
      error: (error) => {
        this.connectionStatus = {
          success: false,
          message: `Connection failed: ${error.message || 'Unknown error'}`
        };
      }
    });
  }
} 