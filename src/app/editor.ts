import { EditorComponent as RichEditor } from './editor-rich/editor.component';
import { EditorComponent as LicitEditor } from './editor-licit/editor.component';

// Only export the one to use
export const EditorComponent = RichEditor;
//export const EditorComponent = LicitEditor;

export function whichEditor(): string {
  if (EditorComponent === RichEditor as any) {
    return 'RichTextEditor';
  }
  if (EditorComponent === LicitEditor as any) {
    return 'Licit';
  }
}
