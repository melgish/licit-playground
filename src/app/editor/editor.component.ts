import {
  Component,
  ElementRef,
  OnDestroy,
  OnChanges,
  forwardRef,
  Input,
  SimpleChanges,
  NgZone,
  HostListener,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

// React stuff
import * as React from 'react';
import * as ReactDOM from 'react-dom';
// Licit stuff
import { Licit } from '@modusoperandi/licit';
import { RuntimeService } from '../runtime.service';
import { EditorView } from 'prosemirror-view';
import { TextSelection } from 'prosemirror-state';

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
  // #region Licit Properties
  /**
   * Show or hide prosemirror dev tools (flaky operation)
   */
  @Input() set debug(debug: boolean) {
    this.update({debug});
  }

  /**
   * Setter for use in read-only mode to set content.
   * For use when FormsModule|ReactiveFormsModule are not needed.
   */
  @Input() set doc(doc: any) {
    this.update({ data: doc || null });
    // Do not need to call render here because ngOnChanges will be called after
    // all inputs are updated.
  }

  /**
   * Id of the collaborative document
   * (requires collaboration server)
   */
  @Input() set docID(docID: number) {
    this.update({docID});
    // Do not need to call render here because ngOnChanges will be called after
    // all inputs are updated.
  }

  /**
   * Sets embedded prperty of the react component.
   *
   * @param embedded The new value to set.
   */
  @Input() set embedded(embedded: boolean) {
    embedded = !!embedded;
    this.update({ embedded });
    // Do not need to call render here because ngOnChanges will be called after
    // all inputs are updated.
  }

  /**
   * Cause editor to grow/shrink based on its
   * contents
   */
  @Input() set fitToContent(fitToContent: boolean) {
    this.update({ fitToContent });
    // Do not need to call render here because ngOnChanges will be called after
    // all inputs are updated.
  }

  /**
   * Sets height prperty of the react component.
   *
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
   *
   * @param readOnly The new value to set.
   */
  @Input() set readOnly(readOnly: boolean) {
    this.update({ readOnly });
    // Do not need to call render here because ngOnChanges will be called after
    // all inputs are updated.
  }

  /**
   * Sets width prperty of the react component.
   *
   * @param width The new value to set.
   */
  @Input() set width(width: string) {
    width = width || FILL;
    this.update({ width });
    // Do not need to call render here because ngOnChanges will be called after
    // all inputs are updated.
  }

  /**
   * Sets plugins to use for current instance
   */
  @Input() set plugins(plugins) {
    this.update({plugins});
  }
  //#endregion

  /**
   * Instances get constructed by angular.
   *
   * @param el Host element provided by angular
   */
  constructor(
    private readonly ngZone: NgZone,
    private readonly runtime: RuntimeService,
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
      // Sets editor to embedded mode
      embedded: true,
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
      // provide runtime for uploading and proxying images
      runtime: this.runtime,
      // additional plugins for the editor
      plugins: []
    };
  }

  //#region OnChanges,OnDestroy
  /**
   * Called by angular when any Input() is changed.
   *
   * @hidden
   * @ignore
   */
  ngOnChanges(changes: SimpleChanges): void {
    console.log('ngOnChanges', changes);
    this.render();
  }

  /**
   * Called by angular to clean up component.
   *
   * @hidden
   * @ignore
   */
  ngOnDestroy() {
    console.log('ngOnDestroy');
    // Clean up the react stuff
    ReactDOM.unmountComponentAtNode(this.div);
  }

  /**
   * Listens for click events on component
   * @param target HTML element that was clicked.
   */
  @HostListener('click', ['$event.target'])
  onComponentClick(target: HTMLElement) {
    const EDITOR = '.czi-prosemirror-editor';
    const FRAME = '.czi-editor-frame-body';

    // Click is outside editor area but inside the frame.
    if (!target.closest(EDITOR) && target.closest(FRAME)) {
      this.ngZone.runOutsideAngular(() => {
        if (this.licit) {
          // Return focus to the editor with cursor at end of document.
          const view = this.licit._editorView as EditorView;
          const tr = view.state.tr;
          view.dispatch(tr.setSelection(TextSelection.atEnd(view.state.doc)));
          view.focus();
        }
      });
    }
  }

  //#endregion

  /**
   * Hanldes editor onChange callback.
   *
   * @param data editor data
   */
  private onEditorChange(data: unknown, isEmpty: boolean): void {
    console.log('onEditorChange', isEmpty, data);
    // save data, then notify angular that value has changed.
    this.props.data = data;
    if (isEmpty) {
      this.onChange(null);
    } else {
      this.onChange(data);
    }

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
    this.ngZone.runOutsideAngular(() => {
      if (!this.licit) {
        // Create new react element with current properties.
        const el = React.createElement(Licit, this.props);
        // Fill content with new component.
        ReactDOM.render(el, this.div);
      } else {
        // Update existing react component with current properties.
        this.licit.setProps(this.props);
      }
    });
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
