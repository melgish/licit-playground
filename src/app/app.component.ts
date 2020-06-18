import { Component } from '@angular/core';
import { cloneDeep } from 'lodash';
import { saveAs } from 'file-saver';

import HELLO_WORLD from './docs/hello-world.json';
import FONT_TEST from './docs/font-test.json';

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

  fonts() {
    this.content = cloneDeep(FONT_TEST);
  }

  save() {
    const json = JSON.stringify(this.content, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'content.json');
  }

  private read(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          resolve(JSON.parse(event.target.result as string));
        } catch {
          reject(new Error("Unable to parse file"));
        }
      }
      reader.onerror = () => {
        reject(new Error("Error reading file"));
      }
      reader.readAsText(file, 'utf-8');
    });
  }

  async load(files: ArrayLike<File>) {
    if (files.length) {
      this.content = await this.read(files[0]);
    }
  }
}
