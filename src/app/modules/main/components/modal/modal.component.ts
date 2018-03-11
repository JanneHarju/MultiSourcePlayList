import { Component } from '@angular/core';

@Component({
    selector: 'my-modal',
    templateUrl: 'modal.component.html',
    styleUrls: [ './modal.component.css' ],
})

export class ModalComponent {

  public visible = false;
  public visibleAnimate = false;

  public show(): void {
    this.visible = true;
    setTimeout(() => this.visibleAnimate = true, 100);
  }

  public hide(): void {
    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 300);
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