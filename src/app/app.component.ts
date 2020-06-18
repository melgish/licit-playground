import { Component, OnInit } from "@angular/core";
import { cloneDeep } from "lodash";
import { saveAs } from "file-saver";

import HELLO_WORLD from "./docs/hello-world.json";
import FONT_TEST from "./docs/font-test.json";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  visible = true;

  disabled = false;

  content: any = null;

  width = "";

  height = "";

  readOnly = false;

  /**
   * Called by angular when component is ready...
   */
  ngOnInit() {
    this.recall();
  }

  /**
   * Update local content and session storage.
   * @param content
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
  clear() {
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
  save() {
    const json = JSON.stringify(this.content, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    saveAs(blob, "content.json");
  }

  /**
   * Read and load the current file
   * @param file
   */
  private read(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          resolve(JSON.parse(event.target.result as string));
        } catch {
          reject(new Error("Unable to parse file"));
        }
      };
      reader.onerror = () => {
        reject(new Error("Error reading file"));
      };
      reader.readAsText(file, "utf-8");
    });
  }

  /**
   * Load the file from disk
   * @param files
   */
  async load(files: ArrayLike<File>) {
    if (files.length) {
      this.store(await this.read(files[0]));
    }
  }
}
