import { EditorState, Transaction } from 'prosemirror-state';

export interface EditorChangeEvent {
  state: EditorState;
  transaction: Transaction;
}
