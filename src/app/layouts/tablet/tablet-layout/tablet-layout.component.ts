import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TabletHeaderComponent } from '../tablet-header/tablet-header.component';
import { TabletNavigationComponent } from '../tablet-navigation/tablet-navigation.component';

@Component({
  selector: 'app-tablet-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    TabletHeaderComponent,
    TabletNavigationComponent
  ],
  templateUrl: './tablet-layout.component.html'
})
export class TabletLayoutComponent {}