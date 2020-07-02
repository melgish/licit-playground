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
// Licit stuff
import { Licit } from 'licit';

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
   * Contains the editor
   */
  private licit: Licit;
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
    // Do not need to call render here because ngOnChanges will be called after
    // all inputs are updated.
  }

  /**
   * Sets readOnly prperty of the react component.
   * @param readOnly The new value to set.
   */
  @Input() set readOnly(readOnly: boolean) {
    this.update({ readOnly });
    // Do not need to call render here because ngOnChanges will be called after
    // all inputs are updated.
  }

  /**
   * Sets width prperty of the react component.
   * @param width The new value to set.
   */
  @Input() set width(width: string) {
    width = width || FILL;
    this.update({ width });
    // Do not need to call render here because ngOnChanges will be called after
    // all inputs are updated.
  }

  /**
   * Instances get constructed by angular
   * @param el Host element provided by angular
   */
  constructor(
    el: ElementRef<HTMLElement>
  ) {
    this.div = el.nativeElement;
    // ControlValueAccessor
    this.onChange = noop;
    this.onTouched = noop;
    // Initial Licit properties.
    this.props = {
      // Document used to intialize editor
      data: null,
      // When true, enables some debugging features in editor.
      debug: false,
      // Disables the control.
      disabled: false,
      // When collaboration is enabled, identifies server session.
      docID: 0,
      // The height of the editor.
      height: FILL,
      // Called by editor when a change happens.
      onChange: this.onEditorChange.bind(this),
      // When true editor will not show toolbar.
      readOnly: false,
      // Called by licit when react component is ready.
      onReady: this.onEditorReady.bind(this),
      // Width of the editor
      width: FILL,
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
   */
  private onEditorChange(data: unknown): void {
    console.log('onEditorChange', data);
    // save data, then notify angular that value has changed.
    this.props.data = data;
    this.onChange(data);
    this.onTouched();
  }
  /**
   * Handles editor onReady callback.
   *
   * @param licit Licit instance
   */
  private onEditorReady(licit: Licit): void {
    console.log('onEditorReady', licit);
    this.licit = licit;
  }

  /**
   * Renders the react component.
   */
  private render() {
    if (!this.licit) {
      // Create new react element with current properties.
      const el = React.createElement(Licit, this.props);
      // Fill content with new component.
      ReactDOM.render(el, this.div);
    } else {
      // Update existing react component with current properties.
      this.licit.setProps(this.props);
    }
  }
  /**
   * Updates one or more component properties.
   *
   * @param prop Map of one or more properties to assign.
   */
  private update(prop: {}): {} {
    console.log('update', prop);
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
   * Called by angular to enable/disable control
   * @param disabled true when control should be disabled.
   */
  setDisabledState(disabled: boolean): void {
    console.log('setDisabledState', disabled);
    this.update({ disabled });
    // Need to manually call render here since ngOnChange isn't fired for
    // ControlValueAccessor changes.
    this.render();
  }
  /**
   * Called by angular when external value is changed...
   * @param data editor content to display
   */
  writeValue(data: unknown): void {
    console.log('writeValue', data);
    // build new editor state from content
    // let editor create a new empty state
    this.update({ data: data || null });
    // Need to manually call render here since ngOnChange isn't fired for
    // ControlValueAccessor changes.
    this.render();
  }
  //#endregion
}
