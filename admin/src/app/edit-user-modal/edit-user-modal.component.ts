import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-edit-user-modal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss']
})
export class EditUserModalComponent implements OnInit {

  @Input('modal') modal;

  constructor() { }

  ngOnInit() {
  }

}
