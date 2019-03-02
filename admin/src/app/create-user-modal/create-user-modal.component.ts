import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-create-user-modal',
  templateUrl: './create-user-modal.component.html',
  styleUrls: ['./create-user-modal.component.scss']
})
export class CreateUserModalComponent implements OnInit {

  @Input('modal') modal;

  constructor() { }

  ngOnInit() {
  }

}
