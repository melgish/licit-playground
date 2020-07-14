import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location } from '@angular/common';
import { cloneDeep } from 'lodash';
import { saveAs } from 'file-saver';

import HELLO_WORLD from './docs/hello-world.json';
import FONT_TEST from './docs/font-test.json';
import { forkJoin, Subscription } from 'rxjs';

import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';
import { mergeMap, map } from 'rxjs/operators';
import { RuntimeService } from './runtime.service';

export interface Meta {
  url: string;
  mimeType: string;
  fileName: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private readonly subs: Subscription[] = [];

  visible = true;

  disabled = false;

  embedded = false;

  content: any = null;

  width = '';

  height = '';

  readOnly = false;

  docs: {url: string, fileName: string }[] = [];

  constructor(
    private readonly auth: AuthService,
    private readonly http: HttpClient,
    private readonly runtime: RuntimeService
  ) {}

  /**
   * Called by angular when component is ready...
   */
  ngOnInit() {
    this.recall();
    this.subs.push(
      this.runtime.fileUploaded.subscribe(data => {
        console.log('fileUploaded', data);
        this.getContent();
      })
    );
    this.getContent();
  }

  ngOnDestroy() {
    this.subs.forEach(sub => sub && sub.unsubscribe());
    this.subs.length = 0;
  }

  /**
   * Update local content and session storage.
   * @param content content instance to store
   */
  store(content) {
    this.content = content;
    const json = JSON.stringify(this.content);
    sessionStorage.setItem('content.json', json);
  }

  /**
   * Recall content from session storage.
   */
  recall() {
    try {
      // load doc from session if exists
      const json = sessionStorage.getItem('content.json');
      if (json) {
        this.content = JSON.parse(json);
      }
    } catch {
      // who cares
    }
  }

  /**
   * Clear content and session storage.
   */
  clearDocument() {
    this.content = null;
    sessionStorage.removeItem('content.json');
  }

  /**
   * Load the Hello World document
   */
  hello() {
    this.store(cloneDeep(HELLO_WORLD));
  }

  /**
   * Load the fonts document
   */
  fonts() {
    this.store(cloneDeep(FONT_TEST));
  }

  /**
   * Save/Download current document to file
   */
  saveDocument() {
    const json = JSON.stringify(this.content, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    saveAs(blob, 'content.json');
  }

  /**
   * Read and load the current file
   * @param file File to read
   */
  private read(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          resolve(JSON.parse(event.target.result as string));
        } catch {
          reject(new Error('Unable to parse file'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      reader.readAsText(file, 'utf-8');
    });
  }

  /**
   * Load the file from disk
   * @param files file to load.
   */
  async loadDocument(input: HTMLInputElement) {
    if (input.files.length) {
      const doc = await this.read(input.files[0]);
      input.value = null;
      this.store(doc);
    }
  }

  /**
   * Fetch token and endpoint from server
   */
  async token() {
    try {
      forkJoin([this.auth.endpoint$, this.auth.token$]).subscribe((value) =>
        console.log(value)
      );
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Fetch list of images from fake content endpoint
   */
  async getContent() {
    try {
      this.docs = await this.auth.endpoint$
      .pipe(
        mergeMap((ep: string) => this.http.get<Meta[]>(ep)),
        map((docs) =>
          docs.map(({ url, mimeType, fileName }) => ({ url, mimeType, fileName }))
        )
      ).toPromise();
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Delete content from CM
   * @param param0 Identifies item to delete
   */

  async deleteContent({url}: { url: string }) {
    try {
      await this.http.delete(url).toPromise();
      await this.getContent();
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Upload content directly to CM
   *
   * @param input input control with file list to upload.
   */
  async uploadContent(input: HTMLInputElement) {
    try {
      if (input.files.length) {
        // Leverage existing method
        await this.runtime.uploadImage(input.files[0]);
      }
    } catch (err) {
      console.log(err);
    }
  }
}
