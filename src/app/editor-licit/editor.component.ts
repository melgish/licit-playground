import { Component, OnInit, ElementRef, OnDestroy, OnChanges, forwardRef, Input, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

// React stuff
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// Licit stuff
import { Licit } from 'licit';
import { EditorState } from "prosemirror-state";
import { Transform } from "prosemirror-transform";


const FILL = '100%';

@Component({
  selector: 'maw-editor',
  template: '',
  styleUrls: ['./editor.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => EditorComponent),
    multi: true
  }]
})
export class EditorComponent implements OnChanges, OnDestroy, ControlValueAccessor  {
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
      // Enables/Disables collaboration.
      collaborative: false,
      // Document used to intialize editor
      data:  null,
      // When true, enables some debugging features in editor.
      debug: false,
      // Disables the control.
      disabled: false,
      // When collaboration is enabled, identifies server session.
      docID: 1,
      // The height of the editor.
      height: FILL,
      // Called by editor when a change happens.
      onChange: this.onEditorChange.bind(this),
      // When true editor will not show toolbar.
      readOnly: false,
      // Width of the editor
      width: FILL

      // Outstanding questions:
      // What goes here to enable / disable toolbar buttons?
      // What goes here to add additional plugins?
      // What goes here to disable existing plugins?
      // What events go here to manage uploads?
    };
  }

  //#region OnChanges,OnDestroy
  /**
   * Called by angular when any Input() is changed.
   */
  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges', changes);
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
   * Hanldes editor onChange callback.
   *
   * @param data editor data
   * @param data.state Editor state before update
   * @param data.transaction Editor state after update
   */
  private onEditorChange(content: unknown): void {
    this.onChange(content);
    this.onTouched();
  }
  /**
   * Renders the react component.
   */
  private render() {
    // Create new react element
    const el = React.createElement(Licit, this.props);
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
    console.log("registerOnChange");
    this.onChange = fn;
  }
  /**
   * Called by angular forms engine to register touch notifier.
   *
   * @param fn angular supplied method.
   */
  registerOnTouched(fn: any): void {
    console.log("registerOnTouched");
    this.onTouched = fn;
  }
  /**
   * Called by angular to enable/disable control
   * @param disabled true when control should be disabled.
   */
  setDisabledState(disabled: boolean): void {
    console.log('setDisabledState', disabled);
    this.update({disabled});
    // Need render here since ngOnChange won't auto fire
    this.render();
  }
  /**
   * Called by angular when external value is changed...
   * @param content
   */
  writeValue(content: unknown): void {
    console.log('writeValue', content);
    if (content) {
      // build new editor state from content
      this.props.data = content;
    } else {
      // let editor create a new empty state
      this.props.data = null;
    }
    // Need render here since ngOnChange won't auto fire
    this.render();
  }
  //#endregion
}
