import { Component, OnInit, ElementRef, OnDestroy, OnChanges, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

// React stuff
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Licit } from 'licit';


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
export class EditorComponent implements OnChanges, OnDestroy, OnInit, ControlValueAccessor  {
  //#region ControlValueAccessor
  /**
   * Stores angular supplied change notifier.
   */
  private onChange: (content: any) => void = noop;
  /**
   * Stores angular supplied touched notifier.
   */
  private onTouched: () => void = noop;
  //#endregion

  private content: any = null;

  private isDisabled = false;

  /**
   * Contains the editor
   */
  private readonly div: HTMLElement = this.el.nativeElement;
  /**
   * Instances get constructed by angular
   * @param el Host element provided by angular
   */
  constructor(private readonly el: ElementRef<HTMLElement>) {}
  /**
   * Renders the react component
   */
  private render() {
    // Replace contents with react element.
    const reactEl = React.createElement(Licit, {
      // Enables/Disables collaboration.
      collaborative: false,
      // When collaboration is enabled, identifies server session.
      docID: 1,
      // When true, enables some debugging features in editor.
      debug: false,

      // Outstanding questions:
      // What goes here to make editor read-only?
      // What goes here to make editor show 'Hello World' on startup?
      // What goes here to receive change notifications from editor?
      // What goes here to change size of editor?
      // What goes here to enable / disable toolbar buttons?
      // What goes here to add additional plugins?
      // What goes here to disable existing plugins?
      // What events go here to manage uploads?
    });
    ReactDOM.render(reactEl, this.div);
  }

  //#region OnChanges,OnDestroy,OnInit
  /**
   * Called by angular when any Input() is changed.
   */
  ngOnChanges(): void {
    this.render();
  }
  /**
   * Called by angular to clean up component.
   */
  ngOnDestroy() {
    // Clean up the react stuff
    ReactDOM.unmountComponentAtNode(this.div);
  }

  /**
   * Called by angular when component is initialized.
   */
  ngOnInit(): void {
    this.render();
  }
  //#endregion

  //#region ControlValueAccessor
  /**
   * Called by angular when external value is changed...
   * @param content
   */
  writeValue(content: any): void {
    // TODO: load content into editor and re-render.
    this.content = content;
    this.render();
  }
  /**
   * Called by angular forms engine to register change notifier.
   * @param fn angular supplied method
   */
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }
  /**
   * Called by angular forms engine to register touch notifier.
   * @param fn angular supplied method
   */
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  /**
   * Called by angular to enable/disable control
   * @param isDisabled
   */
  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
    this.render();
  }
  //#endregion
}
