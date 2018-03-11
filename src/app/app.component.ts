import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'my-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Multisource playlist';
}
