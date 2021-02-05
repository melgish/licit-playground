import { Injectable, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map, mergeMap, tap } from 'rxjs/operators';

// see proxy.config.js
const CM_URI = '/cm-service';
const STYLES_URI = '/style-service';

export interface ImageLike {
  height: number;
  id: string;
  src: string;
  width: number;
}

export interface FileMeta {
  url: string,
  entityId: string,
  encoding: string,
  mimeType: string,
  fileName: string
}
// Response from tiny-cm POST request
export interface UploadResponse {
  statusCode: 200;

  items: FileMeta[];
}

export interface EditorRuntime {
  canUploadImage?: () => boolean;
  uploadImage?: (file: File) => Promise<ImageLike>;
  canProxyImageSrc?: (src: string) => boolean;
  getProxyImageSrc?: (src: string) => string;
}

@Injectable({
  providedIn: 'root',
})
export class RuntimeService implements EditorRuntime {
  /**
   * Hook to update files
   */
  @Output() fileUploaded = new EventEmitter<ImageLike>(true);

  /**
   * Instances are constructed by angular.
   *
   * @param http angular http service.
   */
  constructor(private readonly http: HttpClient) { }

  buildRoute(...segments: string[]) {
    return segments.reduce((o, s) => {
      return Location.joinWithSlash(o, s);
    });
  }

  /**
   * Editor calls this to see if image can be uploaded.
   */
  canUploadImage = (...args) => {
    console.log('canUploadIamge', ...args);
    return true;
  }

  /**
   * Editor calls this to upload an imate file.
   *
   * @param file File to upload
   */
  uploadImage = async (file: File, ...args): Promise<ImageLike> => {
    console.log('uploadFile', file, ...args);
    const formData = new FormData();
    formData.append('file', file, file.name);

    // post file to service using Angular HTTP.
    const url = this.buildRoute(CM_URI, 'content');
    return this.http.post<UploadResponse>(url, formData).pipe(
      // Extract the first item. There can be only one!
      map(rs => rs.items[0]),
      // Convert first item to Licit ImageLike structure
      map((item): ImageLike => ({
        height: 0,
        id: item.entityId,
        src: this.buildRoute(CM_URI, item.url),
        width: 0
      })),
      tap((image) => this.fileUploaded.emit(image))
    ).toPromise();
  }

  /**
   * Test if image can be proxied
   *
   * @param src source path of image.
   */
  canProxyImageSrc = (src: string, ...args): boolean => {
    console.log('canProxyImageSrc', src, ...args);

    return false;
  }

  /**
   * Gets URL of image
   *
   * @param src source path of image.
   */
  getProxyImageSrc = (src: string, ...args): string => {
    console.log('getProxyImageSrc', src, ...args);

    return src;
  }

  // NOT used by editor, but used by playground to display cm files in sidebar
  getFiles(): Promise<FileMeta[]> {
    const url = this.buildRoute(CM_URI, 'content');
    return this.http.get<FileMeta[]>(url).toPromise();
  }

  // NOT used by editor, but used by playground to display cm files in sidebar
  async deleteFile(entityId: string): Promise<void> {
    const url = this.buildRoute(CM_URI, 'content', entityId);
    await this.http.delete(url).toPromise();
  }


  // Style methods required by licit 0.0.18 or later.

}
