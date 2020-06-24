import {
  Component,
  ElementRef,
  OnDestroy,
  OnChanges,
  forwardRef,
  Input,
  SimpleChanges,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

// React stuff
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { Transform } from 'prosemirror-transform';
import { EditorView } from 'prosemirror-view';

import RichTextEditor from 'licit/dist/ui/RichTextEditor';
import LicitRuntime from 'licit/dist/client/LicitRuntime';
import { convertFromJSON } from 'licit';

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
export class EditorComponent implements OnChanges, OnDestroy, ControlValueAccessor {
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
  private readonly props: any;

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

  /**
   * Instances get constructed by angular
   * @param el Host element provided by angular
   */
  constructor(el: ElementRef<HTMLElement>) {
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

      editorState: null,
      runtime: new LicitRuntime(),
      onReady: this.onEditorReady.bind(this),
    };
  }

  //#region OnChanges,OnDestroy,OnInit
  /**
   * Called by angular when any Input() is changed.
   * @changes
   */
  ngOnChanges(): void {
    this.render();
  }
  /**
   * Called by angular to clean up component.
   */
  ngOnDestroy() {
    console.log('ngOnDestroy');
    // Clean up the react stuff
    ReactDOM.unmountComponentAtNode(this.div);
  }
  //#endregion

  /**
   * Hanldes editor onChange callback
   * @param data editor data
   * @param data.state Editor state before update
   * @param data.transaction Editor state after update
   */
  private onEditorChange({ transaction }: { transaction: Transform }): void {
    this.onChange(transaction.doc.toJSON());
    this.onTouched();
  }
  /**
   * Handles editor onReady callback.
   *
   * @param editorView editor instance
   */
  private onEditorReady(editorView: EditorView): void {
    console.log('onEditorReady', editorView);
  }
  /**
   * Renders the react component
   */
  private render() {
    // Create new react element
    const el = React.createElement(RichTextEditor, this.props);
    // Unmount was necessary to trigger update.
    ReactDOM.unmountComponentAtNode(this.div);
    // Fill content with new component.
    ReactDOM.render(el, this.div);
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
    this.render();
  }
  /**
   * Called by angular when external value is changed.
   *
   * @param content
   */
  writeValue(content: any): void {
    console.log('writeValue', content);
    if (content) {
      // build new editor state from content
      this.props.editorState = convertFromJSON(content);
    } else {
      // let editor create a new empty state
      this.props.editorState = null;
    }
    this.render();
  }
  //#endregion
}
