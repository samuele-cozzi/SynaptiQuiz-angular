import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('synaptiquiz');
  private translate = inject(TranslateService);

  constructor() {
    this.translate.addLangs(['en', 'it']);
    this.translate.setDefaultLang('en');

    // Optional: Use browser lang if available
    const browserLang = this.translate.getBrowserLang();
    this.translate.use(browserLang?.match(/en|it/) ? browserLang : 'en');
  }
}
