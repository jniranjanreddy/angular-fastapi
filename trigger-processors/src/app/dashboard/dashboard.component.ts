import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { LogReaderComponent } from '../log-reader/log-reader.component';
import { FormularyComponent } from '../formulary/formulary.component';
import { AuthService } from '../services/auth.service';
import { DashboardService, DashboardType } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, SidebarComponent, LogReaderComponent, FormularyComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentUser: any = null;
  selectedEnvironment: string | null = null;
  activeDashboard: DashboardType = 'tpr';
  tprEnvironment: string | null = null;
  formularyEnvironment: string | null = null;
  
  // Timezone data
  timezones: any[] = [];
  private timeInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    // Check if user is authenticated
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Subscribe to selected environment (for backward compatibility)
    this.authService.selectedEnvironment$.subscribe(env => {
      this.selectedEnvironment = env;
    });

    // Subscribe to TPR environment
    this.dashboardService.tprEnvironment$.subscribe(env => {
      this.tprEnvironment = env;
    });

    // Subscribe to Formulary environment
    this.dashboardService.formularyEnvironment$.subscribe(env => {
      this.formularyEnvironment = env;
    });

    // Subscribe to active dashboard
    this.dashboardService.activeDashboard$.subscribe(dashboard => {
      this.activeDashboard = dashboard;
    });

    // Initialize timezones
    this.initializeTimezones();
    this.updateTimezones();
    
    // Update timezones every minute
    this.timeInterval = setInterval(() => {
      this.updateTimezones();
    }, 60000);
  }

  getCurrentEnvironment(): string | null {
    if (this.activeDashboard === 'tpr') {
      return this.tprEnvironment || this.selectedEnvironment;
    } else if (this.activeDashboard === 'formulary') {
      return this.formularyEnvironment || this.selectedEnvironment;
    }
    return this.selectedEnvironment;
  }

  initializeTimezones(): void {
    this.timezones = [
      {
        name: 'EST',
        fullName: 'Eastern',
        timezone: 'America/New_York',
        time: ''
      },
      {
        name: 'CST',
        fullName: 'Central',
        timezone: 'America/Chicago',
        time: ''
      },
      {
        name: 'MST',
        fullName: 'Mountain',
        timezone: 'America/Denver',
        time: ''
      },
      {
        name: 'PST',
        fullName: 'Pacific',
        timezone: 'America/Los_Angeles',
        time: ''
      },
      {
        name: 'IST',
        fullName: 'India Standard',
        timezone: 'Asia/Kolkata',
        time: ''
      }
    ];
  }

  updateTimezones(): void {
    const now = new Date();
    this.timezones.forEach(tz => {
      try {
        tz.time = now.toLocaleTimeString('en-US', {
          timeZone: tz.timezone,
          hour12: true,
          hour: 'numeric',
          minute: '2-digit'
        });
      } catch (error) {
        tz.time = 'N/A';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
