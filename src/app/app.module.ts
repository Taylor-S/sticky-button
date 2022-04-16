import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { StickyButtonComponent } from './sticky-button/sticky-button.component';

@NgModule({
  declarations: [
    AppComponent,
    StickyButtonComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
