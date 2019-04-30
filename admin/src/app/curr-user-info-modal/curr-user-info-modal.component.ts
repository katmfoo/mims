import { Component, OnInit, Input } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-curr-user-info-modal',
  templateUrl: './curr-user-info-modal.component.html',
  styleUrls: ['./curr-user-info-modal.component.scss']
})
export class CurrUserInfoModalComponent implements OnInit {

  public username: string;
  public errorMsg: string;

  @Input('modal') modal;

  constructor(private apiCall: ApiCallService, private modalService: NgbModal, private router: Router) { }

  ngOnInit() {
    this.username = localStorage.getItem('current-username');
    document.getElementById("username").innerText = this.username;
    this.apiCall.get('/users/', {username: this.username}).then((response: any) => {
        console.log(response);
        console.log(response.data.users[0]);
        let user = response.data.users[0];
        document.getElementById("firstName").innerText = user.first_name;
        document.getElementById("lastName").innerText = user.last_name;
        document.getElementById("userId").innerText = user.id;
        var user_type : string;
        if (user.type == 1) {
          user_type = "Manager";
        }
        else {
          user_type = "Employee";
        }
        document.getElementById("userType").innerText = user_type;
    });
  }
  
  open(content) {
    var edit_permission = confirm("You are about to edit your own user information. Do you wish to continue?"
        + "\nNote: editing your own information may cause issues with your permission on this page.");
    if (edit_permission) {
      this.modal.close();
      this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
        //this.updateUsers();
      }, (reason) => {
        console.log('rejected');
      });
    }

  }

}
