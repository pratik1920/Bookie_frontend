import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  readonly isDarkMode = signal(false);

  constructor() {
    const saved = this.document.defaultView?.localStorage.getItem('bookswap-theme');
    this.isDarkMode.set(saved === 'dark');

    effect(() => {
      const dark = this.isDarkMode();
      const root = this.document.documentElement;
      root.classList.toggle('dark', dark);
      this.document.defaultView?.localStorage.setItem('bookswap-theme', dark ? 'dark' : 'light');
    });
  }

  toggleTheme(): void {
    this.isDarkMode.update((value) => !value);
  }
}
