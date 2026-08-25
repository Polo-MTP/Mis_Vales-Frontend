import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FeedbackAutoScrollService } from './shared/services/feedback-auto-scroll.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  constructor() {
    inject(FeedbackAutoScrollService).iniciar();
  }
}