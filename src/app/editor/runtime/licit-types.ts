// Licit doesn't export types in any way that can be used here for
// intellisense.  I've copied and modified these definitions from
// @modusoperandi/licit/dist/types/Types.js.flow version 0.0.20
//
// At this time the EditorRuntime does not include style methods.
// so those are exported as a second interface though they must
// be part of the same runtime implementation passed to editor component

/**
 * Expected response from
 */
export interface ImageLike {
  height: number;
  id: string;
  src: string;
  width: number;
}

export interface StyleProps {
  /**
   * Name of the style. Case insensitive value must be unique.
   */
  styleName: string;
  mode?: number;
  description?: string;
  styles?: {
    align?: string;
    boldNumbering?: boolean;
    boldPartial?: boolean;
    boldSentence?: boolean;
    fontName?: string;
    fontSize?: string;
    strong?: boolean;
    em?: boolean;
    underline?: boolean;
    color?: string;
    textHighlight?: string;
    hasNumbering?: boolean;
    paragraphSpacingAfter?: string;
    paragraphSpacingBefore?: string;
    styleLevel?: string;
    lineHeight?: string;
    isLevelbased?: boolean;
    indent?: string;
  };
}

export type RenderCommentProps = {
  commentThreadId: string;
  isActive: boolean;
  requestCommentThreadDeletion: Function;
  requestCommentThreadReflow: Function;
};

export interface EditorRuntime {
  // Image Proxy
  canProxyImageSrc?: (src: string) => boolean;
  getProxyImageSrc?: (src: string) => string;

  // Image Upload
  canUploadImage?: () => boolean;
  uploadImage?: (obj: Blob) => Promise<ImageLike>;

  // Comments
  canComment?: () => boolean;
  createCommentThreadID?: () => string;
  // Not importing react until this function is necessary
  // renderComment?: (props: RenderCommentProps) => ?React.Element<any>,
  renderComment?: (props: RenderCommentProps) => any;

  // External HTML
  canLoadHTML?: () => boolean;
  loadHTML?: () => Promise<string>;
}


export interface StylesRuntime {
  /**
   * Gets array of styles from the service
   */
  getStylesAsync(): Promise<StyleProps[]>;
  /**
   * Renames an existing style from the service.
   * @param oldStyleName
   * @param newStyleName
   */
  renameStyle(oldStyleName: string, newStyleName: string): Promise<StyleProps[]>;

  removeStyle(name: string): unknown;
}
