import { Component, ApplicationRef, } from '@angular/core';

@Component({
  selector: 'my-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'Multisource playlist';
  constructor(private applicationRef: ApplicationRef) {
    this.applicationRef.isStable.subscribe(x => {
      console.log('isStable', x);
    });
  }
}
