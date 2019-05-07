import { Component, OnInit, Input } from '@angular/core'; //imports input property, ngOnInIt to handle initilization, and components
import { ApiCallService } from '../services/api-call.service';  //imports apicallservice to call api
import { Router } from '@angular/router';    //import class router
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';   

@Component({
  selector: 'app-edit-user-modal',
  templateUrl: './edit-user-modal.component.html',
  styleUrls: ['./edit-user-modal.component.scss']
})
export class EditUserModalComponent implements OnInit {
  // set the following equal to the values inputted into the html page during attemptUserCreation()
  public user_id : number;

  public first_name : string; //first name 
  public last_name : string;  //last name
  public type : number;  //2 for employee, 1 for manager
  public username: string;  //username

  public new_password: string;  //passwords
  public confirm_password : string;

  public errorMsg: string; //for not filled out fields or  passwords not matching

  @Input('modal') modal;

  @Input('username-input') username_input;

  constructor(private apiCall: ApiCallService, private router: Router) { }

  ngOnInit() {
    console.log(this.username_input);
    // get user data first, send to PUT
    this.apiCall.get('/users/', {username: this.username_input}).then((response: any) => {
      console.log(response);
      console.log(response.data.users[0]);
      let user = response.data.users[0];
      this.user_id = user.id;
      this.first_name = user.first_name;
      this.last_name = user.last_name;
      this.type = user.type;
      this.username = user.username;
    })
  }

  editUser() {
    // Reset error message
    this.errorMsg = "";

    // Ensure all fields are filled out (not including user type, always specified)
    if (!this.username || !this.first_name || !this.last_name || !this.type) {
      this.errorMsg = "All fields are required";
    } else if ((this.new_password && !this.confirm_password) || (this.confirm_password && !this.new_password)) {
      this.errorMsg = "All fields are required";
    } else if (this.new_password != this.confirm_password) {
      this.errorMsg = "Passwords must match";
    } else {
      console.log(this.user_id);
      
      this.apiCall.put('/users/' + this.user_id + '/', { // users.py PUT method edits users
        username: this.username,      // MUST BE IN ORDER: username, first_name, last_name, password, type
        first_name: this.first_name,
        last_name: this.last_name,
        new_password: this.new_password,
        type: Number(this.type)
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
