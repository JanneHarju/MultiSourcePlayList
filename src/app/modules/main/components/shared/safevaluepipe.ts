import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer} from '@angular/platform-browser';

@Pipe({ name: 'safevalue' })
export class SafeValuePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(value: number) {
    if (value) {
      return value;
    } else {
      return 0;
    }
  }
}
