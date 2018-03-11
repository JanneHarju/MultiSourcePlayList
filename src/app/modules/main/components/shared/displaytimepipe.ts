import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'displaytime'})
export class DisplayTimePipe  implements PipeTransform {
    transform(input: number): string {
        if (input) {
            let secs = Math.round((0 + input) / 1000);
            let mins = Math.floor(secs / 60);
            secs -= mins * 60;
            const hours = Math.floor(mins / 60);
            mins -= hours * 60;
            if (hours > 0) {
                return hours + ':' + this.twodigit(mins) + ':' + this.twodigit(secs);
            } else {
                return mins + ':' + this.twodigit(secs);
            }
        } else {
            return '';
        }
    }
    twodigit(n: number) {
        if (n < 10) {
            return '0' + n;
        } else {
            return n;
        }
    }
}
