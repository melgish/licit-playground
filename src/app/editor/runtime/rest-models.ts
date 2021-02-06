


// Response from tiny-cm POST /content request
export interface PostContentResponse {
  statusCode: 200;

  items: FileMeta[];
}

// Response from tiny-cm GET /content request
export interface FileMeta {
  url: string,
  entityId: string,
  encoding: string,
  mimeType: string,
  fileName: string
}

