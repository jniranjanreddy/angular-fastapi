import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { DashboardService } from '../services/dashboard.service';
import { environment } from '../../environments/environment';

interface FormularyRequest {
  patient_id: string;
  drug_name?: string;
  ndc_code?: string;
  environment: string;
}

interface FormularyResponse {
  status: string;
  message: string;
  patient_id: string;
  drug_info?: any;
  coverage_details?: any;
  timestamp: string;
}

interface SearchRequest {
  search_term: string;
  search_type: string;
  environment: string;
}

@Component({
  selector: 'app-formulary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './formulary.component.html',
  styleUrls: ['./formulary.component.css']
})
export class FormularyComponent implements OnInit {
  activeTab: string = 'coverage';
  
  // Coverage Check Form
  coverageForm = {
    patient_id: '',
    drug_name: '',
    ndc_code: ''
  };
  
  // Search Form
  searchForm = {
    search_term: '',
    search_type: 'drug_name'
  };
  
  // Results
  coverageResult: FormularyResponse | null = null;
  searchResults: any[] = [];
  popularDrugs: any[] = [];
  
  // Loading states
  isLoadingCoverage = false;
  isLoadingSearch = false;
  isLoadingPopular = false;
  
  // Error states
  coverageError: string | null = null;
  searchError: string | null = null;
  
  selectedEnvironment: string = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit() {
    // Subscribe to formulary environment
    this.dashboardService.formularyEnvironment$.subscribe(env => {
      this.selectedEnvironment = env || '';
    });
    
    // Fallback to auth service environment if no formulary environment set
    this.authService.selectedEnvironment$.subscribe(env => {
      if (!this.selectedEnvironment && env) {
        this.selectedEnvironment = env;
      }
    });
    
    this.loadPopularDrugs();
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.clearResults();
  }

  clearResults() {
    this.coverageResult = null;
    this.searchResults = [];
    this.coverageError = null;
    this.searchError = null;
  }

  checkCoverage() {
    if (!this.coverageForm.patient_id.trim()) {
      this.coverageError = 'Patient ID is required';
      return;
    }

    if (!this.selectedEnvironment) {
      this.coverageError = 'Please select an environment';
      return;
    }

    this.isLoadingCoverage = true;
    this.coverageError = null;
    this.coverageResult = null;

    const request: FormularyRequest = {
      patient_id: this.coverageForm.patient_id.trim(),
      environment: this.selectedEnvironment
    };

    if (this.coverageForm.drug_name.trim()) {
      request.drug_name = this.coverageForm.drug_name.trim();
    }

    if (this.coverageForm.ndc_code.trim()) {
      request.ndc_code = this.coverageForm.ndc_code.trim();
    }

    this.http.post<FormularyResponse>(`${environment.apiUrl}/formulary/check-coverage`, request)
      .subscribe({
        next: (response) => {
          this.coverageResult = response;
          this.isLoadingCoverage = false;
        },
        error: (error) => {
          this.coverageError = error.error?.detail || 'Error checking coverage';
          this.isLoadingCoverage = false;
        }
      });
  }

  searchFormulary() {
    if (!this.searchForm.search_term.trim()) {
      this.searchError = 'Search term is required';
      return;
    }

    if (!this.selectedEnvironment) {
      this.searchError = 'Please select an environment';
      return;
    }

    this.isLoadingSearch = true;
    this.searchError = null;
    this.searchResults = [];

    const request: SearchRequest = {
      search_term: this.searchForm.search_term.trim(),
      search_type: this.searchForm.search_type,
      environment: this.selectedEnvironment
    };

    this.http.post<any[]>(`${environment.apiUrl}/formulary/search`, request)
      .subscribe({
        next: (response) => {
          this.searchResults = response;
          this.isLoadingSearch = false;
        },
        error: (error) => {
          this.searchError = error.error?.detail || 'Error searching formulary';
          this.isLoadingSearch = false;
        }
      });
  }

  loadPopularDrugs() {
    this.isLoadingPopular = true;
    
    this.http.get<any>(`${environment.apiUrl}/formulary/drugs/popular`)
      .subscribe({
        next: (response) => {
          this.popularDrugs = response.drugs || [];
          this.isLoadingPopular = false;
        },
        error: (error) => {
          console.error('Error loading popular drugs:', error);
          this.isLoadingPopular = false;
        }
      });
  }

  resetCoverageForm() {
    this.coverageForm = {
      patient_id: '',
      drug_name: '',
      ndc_code: ''
    };
    this.clearResults();
  }

  resetSearchForm() {
    this.searchForm = {
      search_term: '',
      search_type: 'drug_name'
    };
    this.clearResults();
  }

  getTierColor(tier: string): string {
    switch (tier) {
      case 'Tier 1': return '#28a745';
      case 'Tier 2': return '#ffc107';
      case 'Tier 3': return '#fd7e14';
      case 'Tier 4': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'covered': return '#28a745';
      case 'not covered': return '#dc3545';
      case 'prior auth required': return '#ffc107';
      default: return '#6c757d';
    }
  }
}
