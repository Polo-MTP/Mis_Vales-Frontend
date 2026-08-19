import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

/** Convierte automáticamente el texto escrito a mayúsculas (para RFC, CURP, etc.). */
@Directive({
  selector: '[appMayusculas]',
  standalone: true
})
export class MayusculasDirective {
  constructor(
    private el: ElementRef<HTMLInputElement>,
    private control: NgControl
  ) {}

  @HostListener('input')
  onInput(): void {
    const posicion = this.el.nativeElement.selectionStart;
    const valor = this.el.nativeElement.value.toUpperCase();

    this.control.control?.setValue(valor);
    this.el.nativeElement.setSelectionRange(posicion, posicion);
  }
}
