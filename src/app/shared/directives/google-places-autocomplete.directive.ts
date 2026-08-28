import { Directive, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { GoogleMapsLoaderService } from '../../core/services/google-maps-loader.service';

declare const google: any;

/**
 * Autocompletado de Google Places sobre un <input> normal (formControlName sigue funcionando,
 * el usuario también puede seguir escribiendo a mano). Se puede sesgar hacia un punto/radio
 * (ej. el área del código postal ya elegido) para que las sugerencias sean más relevantes.
 */
@Directive({
  selector: '[appPlacesAutocomplete]',
  standalone: true
})
export class GooglePlacesAutocompleteDirective implements OnInit, OnChanges, OnDestroy {
  /** 'postal_code' para el campo de CP, 'address' para el campo de Calle. */
  @Input() appPlacesAutocompleteTipo: 'postal_code' | 'address' = 'address';
  /** Centro opcional para sesgar las sugerencias (ej. ubicación del CP ya elegido). */
  @Input() appPlacesAutocompleteSesgo: { lat: number; lng: number } | null = null;
  @Output() lugarSeleccionado = new EventEmitter<any>();

  private autocomplete: any;
  private listener: any;

  constructor(
    private el: ElementRef<HTMLInputElement>,
    private mapsLoader: GoogleMapsLoaderService
  ) {}

  ngOnInit(): void {
    this.mapsLoader.loadPlaces().then(() => this.inicializar());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appPlacesAutocompleteSesgo'] && this.autocomplete) {
      this.aplicarSesgo();
    }
  }

  ngOnDestroy(): void {
    if (this.listener) {
      google.maps.event.removeListener(this.listener);
    }
  }

  private inicializar(): void {
    // La carga del script de Google es asíncrona y separada por campo -- si el usuario ya
    // empezó a escribir antes de que termine, el constructor de Autocomplete de abajo puede
    // robarle el foco y/o el valor al input a medio tecleo (visto como "a veces no deja
    // escribir"). Guardamos el estado de foco/valor/cursor de antes y lo restauramos después
    // para que la inicialización sea invisible si el usuario ya estaba interactuando.
    const inputEl = this.el.nativeElement;
    const teniaFoco = document.activeElement === inputEl;
    const valorPrevio = inputEl.value;
    const cursorPrevio = inputEl.selectionStart;

    this.autocomplete = new google.maps.places.Autocomplete(inputEl, {
      componentRestrictions: { country: 'mx' },
      fields: ['address_components', 'geometry'],
      types: [this.appPlacesAutocompleteTipo],
      // setBounds() por sí solo es solo una preferencia -- Google sigue devolviendo calles de
      // otros estados si no hay suficientes coincidencias cerca del CP elegido. strictBounds
      // hace que de verdad filtre por el círculo del sesgo en vez de rellenar con resultados
      // lejanos que luego pisan Ciudad/Estado si el usuario los elige sin fijarse.
      strictBounds: true
    });

    this.aplicarSesgo();

    this.listener = this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (place?.address_components) {
        this.lugarSeleccionado.emit(place);
      }
    });

    if (teniaFoco) {
      inputEl.value = valorPrevio;
      inputEl.focus();
      inputEl.setSelectionRange(cursorPrevio, cursorPrevio);
    }
  }

  private aplicarSesgo(): void {
    if (!this.autocomplete || !this.appPlacesAutocompleteSesgo) {
      return;
    }

    const centro = new google.maps.LatLng(this.appPlacesAutocompleteSesgo.lat, this.appPlacesAutocompleteSesgo.lng);
    const circulo = new google.maps.Circle({ center: centro, radius: 8000 });
    this.autocomplete.setBounds(circulo.getBounds());
  }
}
