import { Component, forwardRef, HostBinding, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { noop } from 'rxjs';

@Component({
  selector: 'app-toggle',
  templateUrl: './toggle.component.html',
  styleUrls: ['./toggle.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ToggleComponent),
    multi: true
  }]
})
export class ToggleComponent implements ControlValueAccessor {
  /**
   * Holds input value.
   */
  @HostBinding('class.on')
  value = false;
  /**
   * Angular supplied change notification method.
   */
  private onChange: (value: boolean) => void = noop;
  /**
   * Angular supplied touch notification method.
   */
  private onTouched: () => void = noop;
  /**
   * Update display when external value is changed.
   * @param value value to display
   */
  writeValue(value: boolean): void {
    this.value = Boolean(value);
  }
  /**
   * Called by angular to register change detection callback.
   * @param fn Callback for change detection
   */
  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }
  /**
   * Called by angular to register touch detection callback.
   * @param fn Callback for touch detection
   */
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Event handler fired when button is clicked.
   */
  @HostListener('click')
  click() {
    this.value = !this.value;
    this.onChange(this.value);
    this.onTouched();
  }
}
