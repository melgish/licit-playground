import { Component } from '@angular/core';
import { HELLO_WORLD } from './hello-world';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [
    './app.component.scss'
  ]
})
export class AppComponent {
  visible = true;

  disabled = false;

  content: any = null;

  width = '';

  height = '';

  readOnly = false;

  hello() {
    this.content = cloneDeep(HELLO_WORLD);
  }
}
