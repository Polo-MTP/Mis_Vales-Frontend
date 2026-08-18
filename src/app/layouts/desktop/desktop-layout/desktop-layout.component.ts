import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DesktopHeaderComponent } from '../desktop-header/desktop-header.component';
import { DesktopSidebarComponent } from '../desktop-sidebar/desktop-sidebar.component';
import { DesktopFooterComponent } from '../desktop-footer/desktop-footer.component';

@Component({
  selector: 'app-desktop-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    DesktopHeaderComponent,
    DesktopSidebarComponent,
    DesktopFooterComponent
  ],
  templateUrl: './desktop-layout.component.html'
})
export class DesktopLayoutComponent {}