import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'my-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss']
})
export class CheckboxComponent implements OnInit {

  checkedValue: boolean;
  @Output() checkedChange = new EventEmitter();

  @Input()
  get checked() {
    return this.checkedValue;
  }
  set checked(val) {
    this.checkedValue = val;

    this.checkedChange.emit(this.checkedValue);
  }

  @Input()
  label : string;

  constructor() { }

  ngOnInit() {
  }

}
