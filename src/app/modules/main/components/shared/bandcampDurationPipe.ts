import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'bandcampdurationpipe'})
export class BandcampDurationPipe  implements PipeTransform {
    transform(value: string): string {
        // P00H03M44S
        const min = value.substr(4, 2);
        const sec = value.substr(7, 2);
        return `${min}:${sec}`;
    }
}
