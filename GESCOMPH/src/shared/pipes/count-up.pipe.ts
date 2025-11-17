import { Pipe, PipeTransform } from '@angular/core';
import { interval, map, startWith, takeWhile } from 'rxjs';

@Pipe({
  name: 'countUp',
  standalone: true
})
export class CountUpPipe implements PipeTransform {

  // Usar: {{ valor | countUp:1000 | async }}
  transform(end: number, duration = 1000) {
    const fps = 1000 / 60;         // ~60fps
    const steps = Math.max(1, Math.round(duration / fps));
    const stepValue = end / steps;

    return interval(fps).pipe(
      map(i => Math.floor(Math.min(i * stepValue, end))),
      // inclusive=true => emite el último valor (end) antes de completar
      takeWhile(v => v < end, true),
      startWith(0)
    );
  }
}
