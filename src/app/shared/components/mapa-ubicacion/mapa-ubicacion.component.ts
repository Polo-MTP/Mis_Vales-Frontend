import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsLoaderService } from '../../../core/services/google-maps-loader.service';

declare const google: any;

@Component({
  selector: 'app-mapa-ubicacion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mapa-ubicacion.component.html',
  styleUrl: './mapa-ubicacion.component.css'
})
export class MapaUbicacionComponent implements AfterViewInit, OnChanges, OnDestroy {
  /** Coordenadas del destino (dirección a visitar, ej. la distribuidora). */
  @Input({ required: true }) latitud!: number | string;
  @Input({ required: true }) longitud!: number | string;
  @Input() etiqueta = '';

  @ViewChild('mapaEl') private mapaEl?: ElementRef<HTMLDivElement>;

  cargando = signal(true);
  errorCarga = signal<string | null>(null);
  sinUbicacionActual = signal(false);

  private mapa: any;
  private marcadorDestino: any;
  private marcadorActual: any;
  private lineaRuta: any;
  private vistaLista = false;
  private watchId: number | null = null;

  constructor(private mapsLoader: GoogleMapsLoaderService) {}

  ngAfterViewInit(): void {
    this.vistaLista = true;
    this.inicializarMapa();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.vistaLista) {
      return;
    }

    if (changes['latitud'] || changes['longitud']) {
      this.actualizarDestino();
    }
  }

  ngOnDestroy(): void {
    if (this.watchId !== null && 'geolocation' in navigator) {
      navigator.geolocation.clearWatch(this.watchId);
    }
  }

  /** El backend manda latitud/longitud como string (cast decimal:7 en Laravel serializa así). */
  private destino(): { lat: number; lng: number } {
    return { lat: Number(this.latitud), lng: Number(this.longitud) };
  }

  private inicializarMapa(): void {
    this.mapsLoader
      .load()
      .then(() => {
        if (!this.mapaEl) {
          return;
        }

        const destino = this.destino();

        this.mapa = new google.maps.Map(this.mapaEl.nativeElement, {
          center: destino,
          zoom: 16,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true
        });

        this.marcadorDestino = new google.maps.Marker({
          position: destino,
          map: this.mapa,
          title: this.etiqueta ? `Destino: ${this.etiqueta}` : 'Destino',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: '#ef4444',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        });

        this.cargando.set(false);
        this.iniciarSeguimientoUbicacion();
      })
      .catch(() => {
        this.cargando.set(false);
        this.errorCarga.set('No se pudo cargar el mapa. Revisa tu conexión e intenta de nuevo.');
      });
  }

  private iniciarSeguimientoUbicacion(): void {
    if (!('geolocation' in navigator)) {
      this.sinUbicacionActual.set(true);
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (pos) => this.onUbicacionActual({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => this.sinUbicacionActual.set(true),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 }
    );
  }

  private onUbicacionActual(posicion: { lat: number; lng: number }): void {
    this.sinUbicacionActual.set(false);

    if (!this.marcadorActual) {
      this.marcadorActual = new google.maps.Marker({
        position: posicion,
        map: this.mapa,
        title: 'Tu ubicación',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3b82f6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });
    } else {
      this.marcadorActual.setPosition(posicion);
    }

    if (!this.lineaRuta) {
      this.lineaRuta = new google.maps.Polyline({
        path: [posicion, this.destino()],
        strokeColor: '#3b82f6',
        strokeOpacity: 0.7,
        strokeWeight: 3,
        map: this.mapa
      });
    } else {
      this.lineaRuta.setPath([posicion, this.destino()]);
    }

    this.ajustarVista(posicion);
  }

  private ajustarVista(actual: { lat: number; lng: number }): void {
    const bounds = new google.maps.LatLngBounds();
    bounds.extend(actual);
    bounds.extend(this.destino());
    this.mapa.fitBounds(bounds, 60);
  }

  private actualizarDestino(): void {
    if (!this.mapa || !this.marcadorDestino) {
      return;
    }

    const destino = this.destino();
    this.marcadorDestino.setPosition(destino);

    if (this.marcadorActual) {
      this.lineaRuta?.setPath([this.marcadorActual.getPosition(), destino]);
      this.ajustarVista(this.marcadorActual.getPosition().toJSON());
    } else {
      this.mapa.setCenter(destino);
    }
  }
}
