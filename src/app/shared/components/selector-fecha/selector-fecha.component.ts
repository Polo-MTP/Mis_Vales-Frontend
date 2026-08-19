import { AfterViewInit, Component, ElementRef, HostListener, Input, OnDestroy, ViewChild, forwardRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Selector de fecha 100% por clic (sin escritura manual), con calendario propio en vez del
 * <input type="date"> nativo del navegador — el nativo no abría de forma confiable con el
 * input en readonly y estilos oscuros personalizados.
 */
@Component({
  selector: 'app-selector-fecha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selector-fecha.component.html',
  styleUrl: './selector-fecha.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorFechaComponent),
      multi: true
    }
  ]
})
export class SelectorFechaComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
  /** Fecha más reciente seleccionable, formato YYYY-MM-DD (ej. hoy - 18 años). */
  @Input() fechaMaxima?: string;
  /** Fecha más antigua seleccionable, formato YYYY-MM-DD. */
  @Input() fechaMinima?: string;
  @Input() placeholder = 'dd/mm/aaaa';

  @ViewChild('trigger') private triggerEl?: ElementRef<HTMLButtonElement>;
  @ViewChild('panel') private panelEl?: ElementRef<HTMLDivElement>;

  readonly meses = MESES;

  abierto = signal(false);
  valorSeleccionado = signal<string | null>(null);
  mesVisible = signal(new Date().getMonth());
  anioVisible = signal(new Date().getFullYear());

  disabled = false;
  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  private cerrarAlDesplazar = () => this.cerrar();

  constructor(private el: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    /** Se saca del template ya (oculto) para que quede fuera de las tarjetas con backdrop-blur. */
    if (this.panelEl) {
      document.body.appendChild(this.panelEl.nativeElement);
    }
  }

  ngOnDestroy(): void {
    this.panelEl?.nativeElement.remove();
    window.removeEventListener('scroll', this.cerrarAlDesplazar, true);
    window.removeEventListener('resize', this.cerrarAlDesplazar);
  }

  @HostListener('document:click', ['$event'])
  onClickFuera(event: MouseEvent): void {
    const target = event.target as Node;
    const dentroDelTrigger = this.el.nativeElement.contains(target);
    const dentroDelPanel = this.panelEl?.nativeElement.contains(target) ?? false;

    if (this.abierto() && !dentroDelTrigger && !dentroDelPanel) {
      this.cerrar();
    }
  }

  private cerrar(): void {
    this.abierto.set(false);
    this.onTouched();
  }

  /**
   * El panel se saca de las tarjetas (.dash-card usa backdrop-blur, que crea su propio
   * contexto de apilamiento y atrapa el z-index) y se ancla a <body> con position:fixed,
   * calculando su posición justo debajo del botón. Así siempre queda encima de todo.
   */
  private posicionarPanel(): void {
    if (!this.panelEl || !this.triggerEl) {
      return;
    }

    const panel = this.panelEl.nativeElement;
    const rect = this.triggerEl.nativeElement.getBoundingClientRect();

    panel.style.position = 'fixed';
    panel.style.top = `${rect.bottom + 8}px`;
    panel.style.left = `${rect.left}px`;
    panel.style.minWidth = `${rect.width}px`;
    panel.style.zIndex = '1000';

    document.body.appendChild(panel);
  }

  writeValue(value: string | null): void {
    this.valorSeleccionado.set(value);

    if (value) {
      const [anio, mes] = value.split('-').map(Number);
      this.anioVisible.set(anio);
      this.mesVisible.set(mes - 1);
    } else if (this.fechaMaxima) {
      const [anio, mes] = this.fechaMaxima.split('-').map(Number);
      this.anioVisible.set(anio);
      this.mesVisible.set(mes - 1);
    }
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  get textoMostrado(): string {
    const valor = this.valorSeleccionado();
    if (!valor) return '';

    const [anio, mes, dia] = valor.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  toggleAbierto(): void {
    if (this.disabled) return;

    const abrira = !this.abierto();
    this.abierto.set(abrira);

    if (abrira) {
      queueMicrotask(() => this.posicionarPanel());
      window.addEventListener('scroll', this.cerrarAlDesplazar, true);
      window.addEventListener('resize', this.cerrarAlDesplazar);
    } else {
      window.removeEventListener('scroll', this.cerrarAlDesplazar, true);
      window.removeEventListener('resize', this.cerrarAlDesplazar);
    }
  }

  get diasDelMes(): (number | null)[] {
    const primerDia = new Date(this.anioVisible(), this.mesVisible(), 1).getDay();
    const totalDias = new Date(this.anioVisible(), this.mesVisible() + 1, 0).getDate();

    const dias: (number | null)[] = [];
    for (let i = 0; i < primerDia; i++) {
      dias.push(null);
    }
    for (let d = 1; d <= totalDias; d++) {
      dias.push(d);
    }
    return dias;
  }

  get anios(): number[] {
    const maxAnio = this.fechaMaxima ? Number(this.fechaMaxima.slice(0, 4)) : new Date().getFullYear();
    const minAnio = this.fechaMinima ? Number(this.fechaMinima.slice(0, 4)) : maxAnio - 100;

    const lista: number[] = [];
    for (let a = maxAnio; a >= minAnio; a--) {
      lista.push(a);
    }
    return lista;
  }

  cambiarMes(delta: number): void {
    let mes = this.mesVisible() + delta;
    let anio = this.anioVisible();

    if (mes < 0) {
      mes = 11;
      anio--;
    } else if (mes > 11) {
      mes = 0;
      anio++;
    }

    this.mesVisible.set(mes);
    this.anioVisible.set(anio);
  }

  cambiarAnio(anio: number): void {
    this.anioVisible.set(Number(anio));
  }

  private formatearFecha(anio: number, mes: number, dia: number): string {
    const mm = String(mes + 1).padStart(2, '0');
    const dd = String(dia).padStart(2, '0');
    return `${anio}-${mm}-${dd}`;
  }

  esDeshabilitado(dia: number): boolean {
    const fecha = this.formatearFecha(this.anioVisible(), this.mesVisible(), dia);
    if (this.fechaMaxima && fecha > this.fechaMaxima) return true;
    if (this.fechaMinima && fecha < this.fechaMinima) return true;
    return false;
  }

  esSeleccionado(dia: number): boolean {
    return this.valorSeleccionado() === this.formatearFecha(this.anioVisible(), this.mesVisible(), dia);
  }

  seleccionarDia(dia: number): void {
    if (this.esDeshabilitado(dia)) return;

    const fecha = this.formatearFecha(this.anioVisible(), this.mesVisible(), dia);
    this.valorSeleccionado.set(fecha);
    this.onChange(fecha);
    this.onTouched();
    this.abierto.set(false);
  }

  limpiar(event: Event): void {
    event.stopPropagation();
    this.valorSeleccionado.set(null);
    this.onChange(null);
    this.onTouched();
  }
}
