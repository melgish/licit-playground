import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { EditorComponent } from './editor-licit/editor.component';
import { FormsModule } from '@angular/forms';
import { ToggleComponent } from './toggle/toggle.component';

@NgModule({
  declarations: [AppComponent, EditorComponent, ToggleComponent],
  exports: [EditorComponent, FormsModule],
  imports: [BrowserModule, FormsModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
