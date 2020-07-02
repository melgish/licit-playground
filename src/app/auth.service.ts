import { Location } from '@angular/common';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, defer } from 'rxjs';
import { mergeMap, shareReplay, map } from 'rxjs/operators';
import { get } from 'lodash';
import { stringify } from 'querystring';

/**
 * Create URL from different components.
 * @param root root URI to start from
 * @param args additional path elements to add
 */
function slash(root: string, ...args: string[]): string {
  return args.reduce((out, arg) => Location.joinWithSlash(out, arg), root);
}

export class AuthService implements HttpInterceptor {
  /**
   * Gets and caches contentEndpoint from configuration using fetch api
   */
  readonly endpoint$: Observable<string> = defer(() =>
    fetch('assets/runtime-config.json5')
  ).pipe(
    mergeMap((rs) => rs.json()),
    map((json) => get(json, 'contentEndpoint', 'movia/content')),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  /**
   * Gets parameters required to issue keycloak token request from keycloak.json
   */
  readonly token$: Observable<string> = defer(() => fetch('assets/keycloak.json')).pipe(
    // Convert response to json
    mergeMap((rs) => rs.json()),
    map((json: any) => {
      // Convert JSON response into values to use in token request...
      const url = get(json, 'auth-server-url');
      const realm = get(json, 'realm');
      const client = get(json, 'resource');
      const secret = get(json, ['credentials', 'secret']);
      return {
        url: slash(url, 'realms', realm, 'protocol/openid-connect/token'),
        options: {
          method: 'POST',
          body: stringify({
            grant_type: 'client_credentials',
            client_id: client,
            client_secret: secret,
          }),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Accept: 'application/json',
          },
        },
      };
    }),
    // Cache the completed request permanently.
    shareReplay({ bufferSize: 1, refCount: true }),
    mergeMap(({ url, options }) => fetch(url, options)),
    // Convert response to json
    mergeMap((rs) => rs.json()),
    map((json: any) => `${json.token_type} ${json.access_token}`),
    // Cache the resulting token for up to 5 minutes
    shareReplay({ bufferSize: 1, refCount: true, windowTime: 5 * 60 * 1000 })
  );

  /**
   * Intercept angular HTTP calls and apply an authorization header.
   */
  intercept<T>(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<T>> {
    return this.token$.pipe(
      mergeMap((token) => {
        if (!token) {
          return next.handle(req);
        }
        return next.handle(
          req.clone({
            setHeaders: { Authorization: token },
          })
        );
      )
    );
  }
}
