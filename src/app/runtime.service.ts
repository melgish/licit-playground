import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { shareReplay, map, mergeMap, pluck, tap } from 'rxjs/operators';
import { Observable, from, forkJoin, defer, merge } from 'rxjs';
import { get } from 'lodash';
import { AuthService } from './auth.service';

export interface ImageLike {
  height: number;
  id: string;
  src: string;
  width: number;
}

export interface UploadResponse {
  link: string;
  entity: {
    id: string;
    type: string[];
    label: string;
  };
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
   * Instances are constructed by angular.
   *
   * @param http angular http service
   */
  constructor(readonly auth: AuthService, private readonly http: HttpClient) {}

  /**
   * Editor calls this to see if image can be uploaded.
   */
  canUploadImage = () => true;

  /**
   * Editor calls this to upload an imate file.
   *
   * @param file File to upload
   */
  uploadImage = async (file: File): Promise<ImageLike> => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    // This code does not reflect reality (yet)
    // In blade, Authorization headers are added by an angular HTTP_INTERCEPTOR
    // Until I have time to implement one in this project, this is a cheap
    // substitution.
    return this.auth.endpoint$.pipe(
        mergeMap(url =>
          this.http.post<UploadResponse>(url, formData).pipe(
            map(
              (rs): ImageLike => ({
                height: 0,
                id: rs.entity.id,
                src: Location.joinWithSlash(url, encodeURIComponent(rs.entity.id)),
                width: 0,
              })
            ),
            tap((data) => console.log('upload response', data))
          )
        )
      )
      .toPromise();
  };

  canProxyImageSrc = (src: string): boolean => {
    console.log('canProxyImageSrc', src);
    return true;
  };

  getProxyImageSrc = (src: string): string => {
    console.log('getProxyImageSrc', src);
    return src;
  };
}
