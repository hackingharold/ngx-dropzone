import { FormControl } from '@angular/forms';
import { FileInputValidators } from '.';

describe('FileInputValidators', () => {

  /** Returns a simple fake file with given size. */
  const getFile = (size: number) =>
    new File([Math.random().toString(16).slice(0, size)], `${Date.now()}.rnd`);

  it('should validate min size', () => {
    const control = new FormControl(getFile(16), [FileInputValidators.minSize(8)]);
    expect(control.hasError('minSize')).toBeFalse();

    control.setValue(getFile(4));
    expect(control.hasError('minSize')).toBeTruthy();
  });

  it('should validate min size within arrays', () => {
    const control = new FormControl([getFile(16)], [FileInputValidators.minSize(8)]);
    expect(control.hasError('minSize')).toBeFalse();

    control.setValue([getFile(16), getFile(4)]);
    expect(control.hasError('minSize')).toBeTruthy();
  });

  it('should validate max size', () => {
    const control = new FormControl(getFile(4), [FileInputValidators.maxSize(8)]);
    expect(control.hasError('maxSize')).toBeFalse();

    control.setValue(getFile(16));
    expect(control.hasError('maxSize')).toBeTruthy();
  });

  it('should validate max size within arrays', () => {
    const control = new FormControl([getFile(4)], [FileInputValidators.maxSize(8)]);
    expect(control.hasError('maxSize')).toBeFalse();

    control.setValue([getFile(16), getFile(4)]);
    expect(control.hasError('maxSize')).toBeTruthy();
  });

  it('should pass null check', () => {
    const control1 = new FormControl(null, [FileInputValidators.minSize(8)]);
    const control2 = new FormControl(null, [FileInputValidators.maxSize(8)]);

    expect(control1.hasError('minSize')).toBeFalse();
    expect(control2.hasError('maxSize')).toBeFalse();
  });
});
