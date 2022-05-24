import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ApportionmentComponent } from './apportionment/apportionment.component';

@NgModule({
  declarations: [
    AppComponent,
    ApportionmentComponent
  ],
  imports: [
    BrowserModule,
    BrowserModule, 
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
