import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppComponent } from "./app.component";
import { EditorComponent } from "./editor/editor.component";
import { FormsModule } from "@angular/forms";

@NgModule({
  declarations: [AppComponent, EditorComponent],
  exports: [EditorComponent, FormsModule],
  imports: [BrowserModule, FormsModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
