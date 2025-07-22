import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LogReaderComponent } from './log-reader/log-reader.component';
import { ApiDemoComponent } from './api-demo/api-demo.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LogReaderComponent, ApiDemoComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'trigger-processors';
}
