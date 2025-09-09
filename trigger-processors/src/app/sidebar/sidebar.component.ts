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
  selectedEnvironment: string | null = null;
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

    // Subscribe to selected environment
    this.authService.selectedEnvironment$.subscribe(env => {
      this.selectedEnvironment = env;
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
        if (!this.selectedEnvironment && response.available_keys.length > 0) {
          this.selectEnvironment(response.available_keys[0]);
        }
      },
      error: (error) => {
        this.error = 'Failed to load environments';
        this.isLoading = false;
        console.error('Error loading environments:', error);
      }
    });
  }

  selectEnvironment(envKey: string): void {
    this.authService.setSelectedEnvironment(envKey);
    this.selectedEnvironment = envKey;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
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
