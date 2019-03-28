import { Component, OnInit, Input } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';
import { Router } from '@angular/router';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-user-modal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss']
})
export class EditUserModalComponent implements OnInit {

  // set the following equal to the values inputted into the html page during attemptUserCreation()
  public user_id : number;
  public first_name : string;
  public last_name : string;
  public type : number; // check for correct data type
  public username: string;
  public password: string;
  public confirm_password : string;
  public errorMsg: string;

  @Input('modal') modal;

  @Input('username-input') username_input;

  constructor(private apiCall: ApiCallService, private router: Router) { }

  ngOnInit() {
    console.log(this.username_input);
    // get user data first, send to PUT
    this.apiCall.get('/users/', {username: this.username_input}).then((response) => {
      console.log(response);
      console.log(response.data.users[0]);
      this.user_id = response.data.users[0].id;
      this.username = response.data.users[0].username;
      this.first_name = response.data.users[0].first_name
      this.last_name = response.data.users[0].last_name;
      // use GET to store data
      this.password = ;
      this.type = ; // Math.floor('type from GET'.valueOf())
    })
  }

  editUser() {
    // Reset error message
    this.errorMsg = "";

    // Ensure all fields are filled out (not including user type, always specified)
    if (!this.username && !this.password && !this.confirm_password && !this.first_name && !this.last_name && !this.type) {
      this.errorMsg = "At least one field required";
      return;
    } else if (this.password != this.confirm_password) { // != or some method?
      this.errorMsg = "Passwords must match";
    } else {
      console.log(this.user_id);
      this.apiCall.put('/users/' + this.user_id, { // users.py PUT method edits users NEED USER ID TO MODIFY
        username: this.username,      // MUST BE IN ORDER: username, first_name, last_name, password, type
        first_name: this.first_name,
        last_name: this.last_name,
        password: this.password,
        type: this.type // convert the value of 'type' to an "int"
      }).then((response: any) => { 
        if (response.success) {
          if (response.data.user_type == 1) {
            this.modal.close(); // close modal after successful user editing
            return;
          } else {
            this.errorMsg = 'Must be manager to edit user information';
            return;
          }
        } else {
          this.errorMsg = response.error.message; // if user editing doesn't work, respond with specified response
          return;
        }
      })
    }
  }

}
