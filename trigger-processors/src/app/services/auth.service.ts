import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    username: string;
    region: string;
  };
  region: string;
}

export interface User {
  id: string;
  username: string;
  region: string;
}

export interface Environment {
  DB_CONN: string;
  NR_KAFKA_HOST_URL: string;
  PATIENT_PREPROCESSOR_KAFKA_TOPIC: string;
  ENV_PREFIX_KAFKA_TOPIC: string;
}

export interface EnvironmentsResponse {
  environments: { [key: string]: Environment };
  region_mapping: {
    IND: string[];
    US: string[];
  };
}

export interface UserEnvironmentsResponse {
  region: string;
  environments: { [key: string]: Environment };
  available_keys: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.apiUrl + '/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private selectedEnvironmentSubject = new BehaviorSubject<string | null>(null);
  
  public currentUser$ = this.currentUserSubject.asObservable();
  public selectedEnvironment$ = this.selectedEnvironmentSubject.asObservable();

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check if user is already logged in on service initialization
    this.initializeFromStorage();
  }

  private initializeFromStorage(): void {
    const token = this.getToken();
    const user = this.getStoredUser();
    const selectedEnv = this.getSelectedEnvironment();
    
    if (token && user) {
      this.currentUserSubject.next(user);
    }
    
    if (selectedEnv) {
      this.selectedEnvironmentSubject.next(selectedEnv);
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, credentials)
      .pipe(
        tap(response => {
          // Store token and user info
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('access_token', response.access_token);
            localStorage.setItem('user', JSON.stringify(response.user));
            localStorage.setItem('region', response.region);
          }
          
          // Update current user subject
          this.currentUserSubject.next(response.user);
        })
      );
  }

  logout(): void {
    // Clear storage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      localStorage.removeItem('region');
      localStorage.removeItem('selected_environment');
    }
    
    // Update subjects
    this.currentUserSubject.next(null);
    this.selectedEnvironmentSubject.next(null);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  getStoredUser(): User | null {
    if (isPlatformBrowser(this.platformId)) {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getRegion(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('region');
    }
    return null;
  }

  verifyToken(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.baseUrl}/verify`, { headers });
  }

  getAllEnvironments(): Observable<EnvironmentsResponse> {
    return this.http.get<EnvironmentsResponse>(`${this.baseUrl}/environments`);
  }

  getUserEnvironments(): Observable<UserEnvironmentsResponse> {
    const headers = this.getAuthHeaders();
    return this.http.get<UserEnvironmentsResponse>(`${this.baseUrl}/user-environments`, { headers });
  }

  setSelectedEnvironment(envKey: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('selected_environment', envKey);
    }
    this.selectedEnvironmentSubject.next(envKey);
  }

  getSelectedEnvironment(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('selected_environment');
    }
    return null;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Helper method to get authorization header for other services
  getAuthHeader(): { [key: string]: string } {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }
}
