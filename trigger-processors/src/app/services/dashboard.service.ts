import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type DashboardType = 'tpr' | 'formulary';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private activeDashboardSubject = new BehaviorSubject<DashboardType>('tpr');
  public activeDashboard$ = this.activeDashboardSubject.asObservable();

  private tprEnvironmentSubject = new BehaviorSubject<string | null>(null);
  public tprEnvironment$ = this.tprEnvironmentSubject.asObservable();

  private formularyEnvironmentSubject = new BehaviorSubject<string | null>(null);
  public formularyEnvironment$ = this.formularyEnvironmentSubject.asObservable();

  constructor() {}

  setActiveDashboard(dashboard: DashboardType): void {
    this.activeDashboardSubject.next(dashboard);
  }

  setTprEnvironment(environment: string): void {
    this.tprEnvironmentSubject.next(environment);
  }

  setFormularyEnvironment(environment: string): void {
    this.formularyEnvironmentSubject.next(environment);
  }

  getCurrentDashboard(): DashboardType {
    return this.activeDashboardSubject.value;
  }

  getCurrentTprEnvironment(): string | null {
    return this.tprEnvironmentSubject.value;
  }

  getCurrentFormularyEnvironment(): string | null {
    return this.formularyEnvironmentSubject.value;
  }
}
