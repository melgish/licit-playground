import { Component, OnInit, ElementRef, OnDestroy, OnChanges, forwardRef, Input, SimpleChanges } from '@angular/core';
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
  /**
   * Current content of the editor
   */
  private content: any = null;
  /**
   * True when editor is disabled
   */
  private isDisabled = false;
  /**
   * Contains the editor
   */
  private readonly div: HTMLElement = this.el.nativeElement;

  @Input() width: string = '';

  @Input() height: string = '';

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

      // Callback raised when editor contents have changed.
      onChange: (state, transaction) => {
        // From what I can tell, state.doc = before the change;
        // And transaction.doc = after the change.

        // Need to capture / transform this value...
        this.onChange(transaction.doc);
      },
      // Should set value
      data: this.content,


      // Set to true to make editor read only.
      readOnly: this.isDisabled,
      // Set width of editor 100%, 5in, 200px etc.
      width: this.width,
      // Set height of editor 100%, 5in, 200px etc.
      height: this.height,

      // Outstanding questions:
      // What goes here to make editor show content on startup?
      // What goes here to enable / disable toolbar buttons?
      // What goes here to add additional plugins?
      // What goes here to disable existing plugins?
      // What events go here to manage uploads?
    } as any);

    ReactDOM.render(reactEl, this.div);
  }

  //#region OnChanges,OnDestroy,OnInit
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

  /**
   * Called by angular when component is initialized.
   */
  ngOnInit(): void {
    console.log('ngOnInit');
    this.render();
  }
  //#endregion

  //#region ControlValueAccessor
  /**
   * Called by angular when external value is changed...
   * @param content
   */
  writeValue(content: any): void {
    console.log('writeValue', content);
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
    console.log('setDisabledState', isDisabled);
    this.isDisabled = isDisabled;
    this.render();
  }
  //#endregion
}
