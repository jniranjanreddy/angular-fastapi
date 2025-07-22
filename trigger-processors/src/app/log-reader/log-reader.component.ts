import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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
  l2PatientId: string = '';
  l3PatientId: string = '';

  // Active tab tracking
  activeTab: string = 'l1';

  // Search methods for each section
  onL1Search(): void {
    console.log('L1 Search submitted for Patient ID:', this.l1PatientId);
    // TODO: Implement L1 search logic
  }

  onL2Search(): void {
    console.log('L2 Search submitted for Patient ID:', this.l2PatientId);
    // TODO: Implement L2 search logic
  }

  onL3Search(): void {
    console.log('L3 Search submitted for Patient ID:', this.l3PatientId);
    // TODO: Implement L3 search logic
  }

  // Tab switching method
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}
