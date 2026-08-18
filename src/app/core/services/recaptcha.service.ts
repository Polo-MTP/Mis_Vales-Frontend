import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const grecaptcha: {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

@Injectable({ providedIn: 'root' })
export class RecaptchaService {
  private siteKey = environment.recaptchaSiteKey;

  /**
   * Ejecuta reCAPTCHA v3 y devuelve el token.
   * @param action Identificador de la acción (ej. 'login', 'register')
   */
  execute(action: string): Promise<string> {
    return new Promise((resolve, reject) => {
      grecaptcha.ready(() => {
        grecaptcha.execute(this.siteKey, { action }).then(resolve).catch(reject);
      });
    });
  }
}
