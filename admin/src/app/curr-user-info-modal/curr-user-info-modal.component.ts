//import 
import { Component, OnInit, Input } from '@angular/core'; //imports input property, ngOnInIt to handle initilization, and components
import { ApiCallService } from '../services/api-call.service'; //imports apicallservice to call api
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap'; //import to open modal windows
import { Router } from '@angular/router'; //import class router
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


  //get current information and pass it to display in user info
  ngOnInit() {
    this.username = localStorage.getItem('current-username');
    document.getElementById("username").innerText = this.username;
    this.apiCall.get('/users/', {username: this.username}).then((response: any) => {
        console.log(response);
        console.log(response.data.users[0]);
        let user = response.data.users[0];
        document.getElementById("firstName").innerText = user.first_name; //get element firstname
        document.getElementById("lastName").innerText = user.last_name; //get element lastname
        document.getElementById("userId").innerText = user.id;  //get element userid
        var user_type : string;
        if (user.type == 1) {
          user_type = "Manager";  //if user type is 1, its a manager
        }
        else {
          user_type = "Employee"; //otherwise its an employee
        }
        document.getElementById("userType").innerText = user_type;  //get element usertype
    });
  }
  
  open(content) {
    //display message is user tries to edit information.
    //check to see if the edit permission tries to edit the currentuser info (their info)
    var edit_permission = confirm("You are about to edit your own user information. Do you wish to continue?"
        + "\nNote: editing your own information may cause issues with your permission on this page.");
    if (edit_permission) {
      this.modal.close();
      let ngbModalOptions: NgbModalOptions = {
        backdrop : 'static',
        keyboard : false,
        ariaLabelledBy : 'modal-basic-title'
      };
      this.modalService.open(content, ngbModalOptions).result.then((result) => {  //open modal display info 
        //this.updateUsers();
      }, (reason) => {
        console.log('rejected');
      });
    }

  }

}
