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
  public type : number;
  public username: string;
  public password: string;
  public confirm_password : string;
  public errorMsg: string;
  public curr_type : number; // current user type for error handling

  @Input('modal') modal;

  @Input('username-input') username_input;

  constructor(private apiCall: ApiCallService, private router: Router) { }

  ngOnInit() {
    console.log(this.username_input);
    // get user data first, send to PUT
    this.apiCall.get('/users/', {username: this.username_input}).then((response: any) => {
      console.log(response);
      console.log(response.data.users[0]);
      this.user_id = response.data.users[0].id;
      // save 'type' because if no input, we need a value that won't change the user info
      this.curr_type = Math.floor(response.data.users[0].type.valueOf()); // just type? math not necessary here?
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
      
      if (!this.type) {
        this.type = this.curr_type;
      }
      this.apiCall.put('/users/' + this.user_id, { // users.py PUT method edits users NEED USER ID TO MODIFY
        username: this.username,      // MUST BE IN ORDER: username, first_name, last_name, password, type
        first_name: this.first_name,
        last_name: this.last_name,
        password: this.password,
        type: Math.floor(this.type.valueOf()) // convert the value of 'type' to an "int"
      }).then((response: any) => { 
        console.log(response);
        if (response.success) {
          this.modal.close();
          return;
        } else {
          this.errorMsg = response.error.message; // if user editing doesn't work, respond with specified response
          return;
        }
      })
    }
  }

}
