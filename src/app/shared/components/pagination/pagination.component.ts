import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {

  @Input() currentPage = 1;
  @Input() lastPage = 1;
  @Input() loading = false;

  @Output() pageChange = new EventEmitter<number>();

  previous(): void {
    if (this.currentPage > 1 && !this.loading) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  next(): void {
    if (this.currentPage < this.lastPage && !this.loading) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }
}