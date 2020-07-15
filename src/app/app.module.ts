import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AngularSplitModule } from 'angular-split';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { ToggleComponent } from './toggle/toggle.component';
import { RuntimeService } from './runtime.service';

// chooses editor to use
import { EditorComponent } from './editor/editor.component';
import { AuthService } from './auth.service';

@NgModule({
  bootstrap: [AppComponent],
  declarations: [
    AppComponent,
    EditorComponent,
    ToggleComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AngularSplitModule,
    NgbTooltipModule,
  ],
  providers: [
    AuthService,
    RuntimeService,
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useExisting: AuthService
    }
  ]
})
export class AppModule {}
