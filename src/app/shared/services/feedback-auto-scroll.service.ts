import { Injectable } from '@angular/core';

const SELECTOR_MENSAJE = '.bg-emerald-950\\/40, .bg-red-950\\/40';

/**
 * Los mensajes de éxito/error tras un submit (fondo bg-emerald-950/40 y bg-red-950/40 -- la
 * convención que usa toda la app para estos avisos) suelen renderizarse arriba del formulario.
 * Si el usuario ya bajó hasta el botón de enviar, el mensaje queda fuera de vista y parece que
 * la app se quedó pensando cuando en realidad ya contestó. Este observer detecta, en cualquier
 * página, cuándo uno de esos bloques aparece en el DOM y lo lleva a la vista solo si no está ya
 * visible -- así no hace falta tocar cada formulario uno por uno para agregar el scroll.
 */
@Injectable({ providedIn: 'root' })
export class FeedbackAutoScrollService {
  private observer: MutationObserver | null = null;

  iniciar(): void {
    if (this.observer || typeof MutationObserver === 'undefined') {
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) {
            return;
          }

          this.buscarMensaje(node)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  }

  private buscarMensaje(node: HTMLElement): HTMLElement | null {
    const candidato = this.esMensaje(node) ? node : node.querySelector<HTMLElement>(SELECTOR_MENSAJE);

    return candidato && !this.yaVisible(candidato) ? candidato : null;
  }

  private esMensaje(node: HTMLElement): boolean {
    return node.classList?.contains('bg-emerald-950/40') || node.classList?.contains('bg-red-950/40');
  }

  private yaVisible(el: HTMLElement): boolean {
    const rect = el.getBoundingClientRect();
    const alturaVentana = window.innerHeight || document.documentElement.clientHeight;

    return rect.top >= 0 && rect.bottom <= alturaVentana;
  }
}
