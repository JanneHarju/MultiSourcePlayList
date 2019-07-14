import { Component, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/takeWhile';
import { of, merge } from 'rxjs';
import { mapTo, delay, take } from 'rxjs/operators';
@Component({
    selector: 'my-modal',
    templateUrl: 'modal.component.html',
    styleUrls: [ './modal.component.css' ],
})

export class ModalComponent {

  public visible = false;
  public visibleAnimate = false;
  private delay = of(null);
  constructor(private cd: ChangeDetectorRef) { }
  public show(): void {
    this.visible = true;
    this.delay.pipe(
      mapTo(true),
      delay(100)
    ).subscribe(x => this.visibleAnimate = x);
  }

  public hide(): void {
    this.visibleAnimate = false;
    this.delay.pipe(
      mapTo(false),
      delay(300)
    ).subscribe(x => this.visible = x);
  }

  public onContainerClicked(event: MouseEvent): void {
    if ((<HTMLElement>event.target).classList.contains('modal')) {
      this.hide();
    }
  }
  public close(): void {
    this.hide();
  }
}
