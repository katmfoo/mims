//imports
//display info from html

import { Component, OnInit, Input } from '@angular/core'; 
import { ApiCallService } from '../services/api-call.service';
import { Router } from '@angular/router';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-help-modal',
  templateUrl: './help-modal.component.html',
  styleUrls: ['./help-modal.component.scss']
})
export class HelpModalComponent implements OnInit {

  @Input('modal') modal;

  constructor(private apiCall: ApiCallService, private router: Router) { }

  ngOnInit() {
    
  }

  modifyDisplay() {
    
  }

  editUser() {
      // close this modal
      // open edit-user-modal with current username
  }

}
