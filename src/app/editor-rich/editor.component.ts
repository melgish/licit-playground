import {
  Component,
  ElementRef,
  OnDestroy,
  OnChanges,
  forwardRef,
  Input,
  SimpleChanges,
  OnInit,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

// React stuff
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { EditorView } from 'prosemirror-view';

import { convertFromJSON } from 'licit';
import createEmptyEditorState from 'licit/dist/createEmptyEditorState';
import RichTextEditor from 'licit/dist/ui/RichTextEditor';


import { EditorChangeEvent } from './models';
import { RuntimeService } from '../runtime.service';

const FILL = '100%';

@Component({
  selector: 'maw-editor',
  template: '',
  styleUrls: ['./editor.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => EditorComponent),
      multi: true,
    },
  ],
})
export class EditorComponent implements OnChanges, OnDestroy, OnInit, ControlValueAccessor {
  //#region ControlValueAccessor
  /**
   * Stores angular supplied change notifier.
   */
  private onChange: (content: unknown) => void = noop;
  /**
   * Stores angular supplied touched notifier.
   */
  private onTouched: () => void = noop;
  //#endregion

  /**
   * Contains the editor
   */
  private readonly div: HTMLElement;
  /**
   * React component properties
   */
  private props: any;
  /**
   * Holds the inner editor instance
   */
  private editorView: EditorView = null;
  /**
   * Sets embedded prperty of the react component.
   * @param embedded The new value to set.
   */
  @Input() set embedded(embedded: boolean) {
    embedded = !!embedded;
    this.update({ embedded });
  }
  /**
   * Sets height prperty of the react component.
   * @param height The new value to set.
   */
  @Input() set height(height: string) {
    height = height || FILL;
    this.update({ height });
  }
  /**
   * Sets readOnly prperty of the react component.
   * @param readOnly The new value to set.
   */
  @Input() set readOnly(readOnly: boolean) {
    this.update({ readOnly });
  }
  /**
   * Sets width prperty of the react component.
   * @param width The new value to set.
   */
  @Input() set width(width: string) {
    width = width || FILL;
    this.update({ width });
  }

  @Input() set placeholder(placeholder: string) {
    placeholder = placeholder || undefined;
    this.update({ placeholder });
  }

  /**
   * Instances get constructed by angular
   * @param el Host element provided by angular
   */
  constructor(
    el: ElementRef<HTMLElement>,
    runtime: RuntimeService
  ) {
    this.div = el.nativeElement;
    // ControlValueAccessor
    this.onChange = noop;
    this.onTouched = noop;
    // Initial Editor properties
    this.props = {
      autoFocus: true,
      children: undefined,
      className: undefined,
      disabled: false,
      embedded: false,
      header: undefined,
      height: FILL,
      onChange: this.onEditorChange.bind(this),
      nodeViews: undefined,
      placeholder: undefined,
      readOnly: false,
      width: FILL,
      editorState: createEmptyEditorState(),
      runtime,
      onReady: this.onEditorReady.bind(this),
    };
  }

  //#region OnChanges,OnDestroy,OnInit
  /**
   * Called by angular when any Input() is changed.
   * @changes
   */
  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges', changes);
    this.render(true);
  }

  ngOnInit() {
    this.render(true);
  }
  /**
   * Called by angular to clean up component.
   */
  ngOnDestroy() {
    console.log('ngOnDestroy');
    // Clean up the react stuff
    ReactDOM.unmountComponentAtNode(this.div);
    this.editorView = null;
  }
  //#endregion

  /**
   * Hanldes editor onChange callback
   * @param data editor data
   */
  private onEditorChange(event: EditorChangeEvent) {

    const { transaction, state } = event;
    ReactDOM.unstable_batchedUpdates(() => {
      // Something wrong with this.
      // Frequently getting mismatched transaction erros in console but unable
      // to diagnose exactly why.

      // Using this 'apply' the fisrt keystroke succeeds, all others fail..
      // const editorState = state.apply(transaction);

      // Using this 'apply' most keystroke edits succeed. However using some
      // menu buttons fail.
      const editorState = this.editorView.state.apply(transaction);
      this.editorView.updateState(editorState);
    });
    if (transaction.docChanged) {
      this.onChange(transaction.doc.toJSON());
      this.onTouched();
    }
  }
  /**
   * Handles editor onReady callback.
   *
   * @param editorView editor instance
   */
  private onEditorReady(editorView: EditorView): void {
    console.log('onEditorReady', editorView);
    this.editorView = editorView;
  }
  /**
   * Renders the react component
   */
  private render(forceRedraw: boolean): void {
    console.log('render', forceRedraw);
    if (forceRedraw) {
      this.ngOnDestroy();
    }
    if (this.editorView) {
      // this.editorView.setProps(this.props);
      this.editorView.updateState(this.props.editorState);
    } else {
      // Create new react element
      const el = React.createElement(RichTextEditor, this.props);
      // Fill content with new component.
      ReactDOM.render(el, this.div);
    }
  }
  /**
   * Updates one or more component properties.
   *
   * @param prop map of properties to assign
   */
  private update(prop: {}): {} {
    return Object.assign(this.props, prop);
  }

  //#region ControlValueAccessor
  /**
   * Called by angular forms engine to register change notifier.
   *
   * @param fn angular supplied method.
   */
  registerOnChange(fn: any): void {
    console.log('registerOnChange');
    this.onChange = fn;
  }
  /**
   * Called by angular forms engine to register touch notifier.
   *
   * @param fn angular supplied method.
   */
  registerOnTouched(fn: any): void {
    console.log('registerOnTouched');
    this.onTouched = fn;
  }
  /**
   * Called by angular to enable/disable control.
   *
   * @param disabled true when c ontrol should be disabled.
   */
  setDisabledState(disabled: boolean): void {
    console.log('setDisabledState', disabled);
    this.update({ disabled });
    this.render(true);
  }
  /**
   * Called by angular when external value is changed.
   *
   * @param content editor content to display
   */
  writeValue(content: any): void {
    console.log('writeValue', content);
    if (content) {
      // build new editor state from content
      this.props.editorState = convertFromJSON(content);
    } else {
      // let editor create a new empty state
      this.props.editorState = createEmptyEditorState();
    }
    // Redrawing the editor in this case isn't necessary...
    this.render(true);
  }
  //#endregion
}
