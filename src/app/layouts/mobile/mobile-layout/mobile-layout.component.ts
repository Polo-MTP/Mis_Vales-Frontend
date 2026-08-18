import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MobileHeaderComponent } from '../mobile-header/mobile-header.component';
import { MobileNavigationComponent } from '../mobile-navigation/mobile-navigation.component';

@Component({
  selector: 'app-mobile-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    MobileHeaderComponent,
    MobileNavigationComponent
  ],
  templateUrl: './mobile-layout.component.html'
})
export class MobileLayoutComponent {}