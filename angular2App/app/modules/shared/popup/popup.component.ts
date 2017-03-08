import { Component, HostBinding } from '@angular/core';
import { Router }                 from '@angular/router';
import { slideInDownAnimation }   from '../animations';
@Component({
    templateUrl: './popup.component.html',
    styles: [require('./popup.component.less')],
    animations: [ slideInDownAnimation ],
    host: {'[@routeAnimation]': ''},
})
export class PopupComponent {
  details: string;
  sending: boolean = false;
  constructor(private router: Router) {}
  ok() {
    this.closePopup();
  }
  closePopup() {
    // Providing a `null` value to the named outlet
    // clears the contents of the named outlet
    this.router.navigate([{ outlets: { popup: null }}]);
  }
}