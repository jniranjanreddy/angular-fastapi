import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserEnvironmentsResponse } from '../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent implements OnInit {
  userEnvironments: UserEnvironmentsResponse | null = null;
  selectedTprEnvironment: string | null = null;
  selectedFormularyEnvironment: string | null = null;
  activeDashboard: 'tpr' | 'formulary' = 'tpr';
  isLoading = false;
  error = '';
  currentUser: any = null;
  isCollapsed = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Subscribe to selected environment (for backward compatibility)
    this.authService.selectedEnvironment$.subscribe(env => {
      if (env && !this.selectedTprEnvironment) {
        this.selectedTprEnvironment = env;
      }
    });

    // Load user environments
    this.loadUserEnvironments();
  }

  loadUserEnvironments(): void {
    this.isLoading = true;
    this.error = '';

    this.authService.getUserEnvironments().subscribe({
      next: (response) => {
        this.userEnvironments = response;
        this.isLoading = false;
        
        // Auto-select first environment if none selected
        if (!this.selectedTprEnvironment && response.available_keys.length > 0) {
          this.selectTprEnvironment(response.available_keys[0]);
        }
        if (!this.selectedFormularyEnvironment && response.available_keys.length > 0) {
          this.selectFormularyEnvironment(response.available_keys[0]);
        }
      },
      error: (error) => {
        this.error = 'Failed to load environments';
        this.isLoading = false;
        console.error('Error loading environments:', error);
      }
    });
  }

  selectTprEnvironment(envKey: string): void {
    this.selectedTprEnvironment = envKey;
    this.authService.setSelectedEnvironment(envKey); // For backward compatibility
    this.activeDashboard = 'tpr';
  }

  selectFormularyEnvironment(envKey: string): void {
    this.selectedFormularyEnvironment = envKey;
    this.activeDashboard = 'formulary';
  }

  setActiveDashboard(dashboard: 'tpr' | 'formulary'): void {
    this.activeDashboard = dashboard;
  }


  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  getEnvironmentDisplayName(key: string): string {
    const displayNames: { [key: string]: string } = {
      'dev': 'Development',
      'qa': 'Quality Assurance',
      'qaperf': 'QA Performance',
      'stage': 'Staging',
      'sup': 'Support',
      'prod': 'Production',
      'US': 'US Environment',
      'IND': 'India Environment'
    };
    return displayNames[key] || `${key.toUpperCase()} Environment`;
  }

  getEnvironmentIcon(key: string): string {
    const icons: { [key: string]: string } = {
      'dev': '🛠️',
      'qa': '🧪',
      'qaperf': '⚡',
      'stage': '🎭',
      'sup': '🛡️',
      'prod': '🚀',
      'US': '🇺🇸',
      'IND': '🇮🇳'
    };
    return icons[key] || '🌐';
  }

  getRegionFlag(region: string): string {
    const flags: { [key: string]: string } = {
      'US': '🇺🇸',
      'IND': '🇮🇳'
    };
    return flags[region] || '🌍';
  }
}
