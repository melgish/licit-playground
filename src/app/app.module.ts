import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { ToggleComponent } from './toggle/toggle.component';
import { HttpClientModule } from '@angular/common/http';
import { RuntimeService } from './runtime.service';

// chooses editor to use
import { EditorComponent } from './editor';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    EditorComponent,
    ToggleComponent
  ],
  imports: [BrowserModule, FormsModule, HttpClientModule],
  providers: [
    RuntimeService
  ]
})
export class AppModule {}
