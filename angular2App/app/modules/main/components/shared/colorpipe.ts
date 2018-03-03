import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'colorpipe'})
export class ColorPipe  implements PipeTransform {
    transform(value: number): string {
        if(value == 1)
        {
            return "darkred";
        }
        else if(value == 2)
        {
            return "forestgreen";
        }
        else
        {
            return "lightslategrey";
        }
    }
}