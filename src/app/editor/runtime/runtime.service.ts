import { Injectable, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

import { ImageLike, StyleProps, EditorRuntime, StylesRuntime } from './licit-types';

import { FileMeta, PostContentResponse } from './rest-models';

// see proxy.config.js
const CM_URI = '/cm-service';
const STYLES_URI = '/style-service';

@Injectable({ providedIn: 'root' })
export class RuntimeService implements EditorRuntime, StylesRuntime {
  /**
   * Hook to update files
   */
  @Output() fileUploaded = new EventEmitter<ImageLike>(true);

  /**
   * Instances are constructed by angular.
   *
   * @param http angular http service.
   */
  constructor(private readonly http: HttpClient) {}

  /**
   * Helper method for building URI
   *
   * @param segments array of path segments to join.
   */
  private buildRoute(...segments: string[]) {
    return segments.reduce((o, s) => {
      return Location.joinWithSlash(o, s);
    });
  }

  // #region EditorRuntime

  /**
   * Editor calls this to see if image can be uploaded.
   */
  canUploadImage(): boolean {
    return true;
  }

  /**
   * Editor calls this to upload an image
   *
   * @param file File to upload
   */
  uploadImage(file: Blob): Promise<ImageLike> {
    console.log('uploadFile', file);
    const url = this.buildRoute(CM_URI, 'content');
    const formData = new FormData();
    formData.append('file', file, (file as File).name);

    // Post file to service using Angular HTTP.
    return new Promise((resolve, reject) => {
      this.http
        .post<PostContentResponse>(url, formData)
        .pipe(
          // Extract the first item. There can be only one!
          map(rs => rs.items[0]),
          // Convert first item to Licit ImageLike structure
          map(
            (item): ImageLike => ({
              height: 0,
              id: item.entityId,
              src: this.buildRoute(CM_URI, item.url),
              width: 0
            })
          ),
          // Raise event for playground update
          tap(image => this.fileUploaded.emit(image))
          // Until it's known how to deal with request errors, they will be
          // rejected and sent to editor as-is.
      )
        .subscribe(resolve, reject);
    });
  }

  // #endregion EditorRuntime

  // #region Styles Runtime
  private styleProps: StyleProps[] = null;
  // Style methods required by licit 0.0.20 or later.

  private fetchStyles(): Promise<StyleProps[]> {
    const url = this.buildRoute(STYLES_URI, 'styles');
    return new Promise((resolve, reject) => {
      // No post processing required since same array format is saved.
      //
      // Until it's known how to deal with request errors, they will be
      // rejected and sent to editor as-is.
      this.http.get<StyleProps[]>(url).subscribe(resolve, reject);
    });
  }

  /**
   * Returns styles to editor
   */
  async getStylesAsync(): Promise<StyleProps[]> {
    if (!this.styleProps) {
      this.styleProps = await this.fetchStyles();
    }
    return this.styleProps;
  }

  /**
   * Renames an existing style on the service.
   *
   * @param oldStyleName name of style to rename
   * @param newStyleName new name to apply to style
   */
  async renameStyle(oldStyleName: string, newStyleName: string): Promise<StyleProps[]> {
    const url = this.buildRoute(STYLES_URI, 'styles', 'rename');
    await new Promise((resolve, reject) => {
      this.http
        .patch(url, {
          oldName: oldStyleName,
          newName: newStyleName
        })
        // No post processing required since result is ignored beyond Angular's
        // built in testing.
        //
        // Until it's known how to deal with request errors, they will be
        // rejected and sent to editor as-is.
      .subscribe(resolve, reject);
    });

    // Refresh from server after rename?
    // This could probably be done here in memory
    this.styleProps = await this.fetchStyles();
    return this.styleProps;
  }

  /**
   * Remove an existing style from the service
   * @param styleName Name of style to delete
   */
  async removeStyle(styleName: string): Promise<StyleProps[]> {
    const url = this.buildRoute(STYLES_URI, 'styles', encodeURIComponent(styleName));
    await new Promise((resolve, reject) => {
      // No post processing required since result is ignored beyond Angular's
      // built in testing.
      //
      // Until it's known how to deal with request errors, they will be
      // rejected and sent to editor as-is.
      this.http.delete(url).subscribe(resolve, reject);
    });

    // Editor handling of response seems to be incomplete in 0.0.20
    // Returning styleProps here jut to be consistent with the other
    // methods.
    //
    // Refresh from server after rename?
    // This could probably be done here in memory.
    this.styleProps = await this.fetchStyles();
    return this.styleProps;
  }

  /**
   * Save or update a style on the service.
   *
   * @param style Style to update.
   */
  async saveStyle(style: StyleProps): Promise<StyleProps[]> {
    const url = this.buildRoute(STYLES_URI, 'styles');
    await new Promise((resolve, reject) => {
      this.http.post<StyleProps>(url, style).subscribe(resolve, reject);
    });
    // Refresh from server after rename?
    // This could probably be done here in memory
    this.styleProps = await this.fetchStyles();
    return this.styleProps;
  }

  // #endregion Styles Runtime

  /**
   * Fetch all file metadata from the service.
   *
   * NOTE Not used by editor, Used here in the playground to display sidebar.
   */
  getFiles(): Promise<FileMeta[]> {
    const url = this.buildRoute(CM_URI, 'content');
    return this.http.get<FileMeta[]>(url).toPromise();
  }

  /**
   * Delete a cm entry from the server.
   *
   * NOTE Not used by editor, Used here in the playground to display sidebar.
   */
  async deleteFile(entityId: string): Promise<void> {
    const url = this.buildRoute(CM_URI, 'content', entityId);
    await this.http.delete(url).toPromise();
  }
}
