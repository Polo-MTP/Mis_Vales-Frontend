import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const google: any;

/**
 * Bootstrap oficial de Google (https://developers.google.com/maps/documentation/javascript/load-maps-js-api)
 * define google.maps.importLibrary de forma síncrona al ejecutarse, evitando la carrera de usar
 * <script onload> manual (importLibrary no queda listo exactamente cuando el script dispara onload).
 */
function bootstrapGoogleMaps(apiKey: string): void {
  ((g: any) => {
    let h: any;
    let a: any;
    let k: string;
    const p = 'The Google Maps JavaScript API';
    const c = 'google';
    const l = 'importLibrary';
    const q = '__ib__';
    const m = document;
    let b: any = window as any;
    b = b[c] || (b[c] = {});
    const d = b.maps || (b.maps = {});
    const r = new Set();
    const e = new URLSearchParams();
    const u = () =>
      h ||
      (h = new Promise(async (f, n) => {
        await (a = m.createElement('script'));
        e.set('libraries', [...r] + '');
        for (k in g) {
          e.set(k.replace(/[A-Z]/g, (t: string) => '_' + t[0].toLowerCase()), g[k]);
        }
        e.set('callback', c + '.maps.' + q);
        a.src = `https://maps.${c}apis.com/maps/api/js?` + e;
        d[q] = f;
        a.onerror = () => (h = n(Error(p + ' could not load.')));
        a.nonce = (m.querySelector('script[nonce]') as HTMLScriptElement | null)?.nonce || '';
        m.head.append(a);
      }));
    d[l] ? console.warn(p + ' only loads once. Ignoring:', g) : (d[l] = (f: any, ...n: any[]) => r.add(f) && u().then(() => d[l](f, ...n)));
  })({ key: apiKey, v: 'weekly' });
}

@Injectable({ providedIn: 'root' })
export class GoogleMapsLoaderService {
  private loadPromise: Promise<void> | null = null;

  /** Arranca el loader oficial (si no se ha hecho) y resuelve cuando la librería 'maps' está lista. */
  load(): Promise<void> {
    if (this.loadPromise) {
      return this.loadPromise;
    }

    if (typeof google === 'undefined' || !google.maps?.importLibrary) {
      bootstrapGoogleMaps(environment.googleMapsApiKey);
    }

    const promise: Promise<void> = google.maps.importLibrary('maps').then(() => undefined);
    this.loadPromise = promise;

    return promise;
  }
}
