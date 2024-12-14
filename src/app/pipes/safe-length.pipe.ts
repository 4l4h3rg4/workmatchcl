import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'safeLength'
})
export class SafeLengthPipe implements PipeTransform {
  transform(value: any[] | null | undefined): number {
    return value?.length ?? 0;
  }
}
