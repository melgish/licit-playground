import { Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { shareReplay, map, mergeMap, pluck, first, withLatestFrom, tap } from 'rxjs/operators';
import { Observable, from, forkJoin } from 'rxjs';
import { get } from 'lodash';

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

/**
 * Create URL from different components.
 * @param root root URI to start from
 * @param args additional path elements to add
 */
function slash(root: string, ...args: string[]): string {
  return args.reduce((out, arg) => Location.joinWithSlash(out, arg), root);
}

/**
 * Create query string from different components.
 * @param value value to assemble.
 */
function amp(value): string {
  return Object.entries(value)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
}

@Injectable({
  providedIn: 'root',
})
export class RuntimeService implements EditorRuntime {
  // Gets and caches keycloak.json for cheezy trusted login
  private readonly keycloak$: Observable<{ url: string; body: string }> = this.http
    .get('assets/keycloak.json')
    .pipe(
      map((raw: any) => ({
        // pluck interesting values from json
        url: get(raw, 'auth-server-url'),
        realm: get(raw, 'realm'),
        client_id: get(raw, 'resource'),
        client_secret: get(raw, ['credentials', 'secret']),
      })),
      map(({ url, realm, client_id, client_secret }) => {
        // convert to components needed to make token request
        url = slash(url, 'realms', realm, 'protocol/openid-connect/token');
        const body = amp({ client_id, client_secret, grant_type: 'client_credentials' });
        return { url, body };
      }),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  // Gets and caches endpoint from cheezy blade configuration
  readonly endpoint$: Observable<string> = this.http
      .get('assets/runtime-config.json5')
      .pipe(
        pluck<unknown, string>('contentEndpoint'),
        shareReplay({ bufferSize: 1, refCount: true })
      );

  // Get keycloak token for uploading to movia.
  readonly token$: Observable<string> = this.keycloak$.pipe(
    mergeMap(({ url, body }) =>
      this.http.post(url, body, {
        headers: new HttpHeaders()
          .append('Content-Type', 'application/x-www-form-urlencoded')
          .append('Accept', 'application/json'),
      })
    ),
    map(
      (raw: { token_type: string; access_token: string }) =>
        `${raw.token_type} ${raw.access_token}`
    ),
    // save and reuse token for up to 5 minutes.
    shareReplay({ bufferSize: 1, refCount: true, windowTime: 1000 * 60 * 5 })
  );

  /**
   * Instances are constructed by angular.
   *
   * @param http angular http service
   */
  constructor(private readonly http: HttpClient) {}

  /**
   * Editor calls this to see if image can be uploaded.
   */
  canUploadImage = () => true;

  /**
   * Editor calls this to upload an imate file.
   *
   * @param file
   */
  uploadImage = async (file: File): Promise<ImageLike> => {
    const formData = new FormData();
    formData.append('file', file, file.name);

    return forkJoin([this.endpoint$, this.token$]).pipe(
      mergeMap(([url, token]) => {
        const headers = new HttpHeaders().append('Authorization', token);
        const options = { headers };
        return this.http.post<UploadResponse>(url, formData, options).pipe(
          map((rs): ImageLike => ({
            height: 0,
            id: rs.entity.id,
            src: Location.joinWithSlash(url, encodeURIComponent(rs.entity.id)),
            width: 0
          })),
          tap(data => console.log('upload response', data))
        );
      })
    ).toPromise();
  }

  canProxyImageSrc = (src: string): boolean => {
    console.log('canProxyImageSrc', src);
    return true;
  }

  getProxyImageSrc = (src: string): string => {
    console.log('getProxyImageSrc', src);
    return src;
  }
}
