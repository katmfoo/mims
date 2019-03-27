import { Component, OnInit, Input } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';
import { Router } from '@angular/router';
import { ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-create-user-modal',
  templateUrl: './create-user-modal.component.html',
  styleUrls: ['./create-user-modal.component.scss']
})
export class CreateUserModalComponent implements OnInit {

  // set the following equal to the values inputted into the html page during attemptUserCreation()
  public first_name : string;
  public last_name : string;
  public type : number; // check for correct data type
  public username: string;
  public password: string;
  public confirm_password : string;
  public errorMsg: string;

  @Input('modal') modal;

  constructor(private apiCall: ApiCallService, private router: Router) { }

  ngOnInit() {}

  createUser() {
    // Reset error message
    this.errorMsg = "";

    // Ensure all fields are filled out (not including user type, always specified)
    if (!this.username || !this.password || !this.confirm_password || !this.first_name || !this.last_name) {
      this.errorMsg = "All fields required"; // NOT WORKING
      return;
    } else if (this.password != this.confirm_password) { // != or some method?
      this.errorMsg = "Passwords must match"; // NOT WORKING
    } else {
      this.apiCall.post('/users/', { // use the createUser method from the API
        username: this.username,      // MUST BE IN ORDER: username, first_name, last_name, password, type
        first_name: this.first_name,
        last_name: this.last_name,
        password: this.password,
        type: Math.floor(this.type.valueOf()) // this.type is not working as of now
      }).then((response: any) => { // figure out what needs to happen after getting response
        if (response.success) {
          if (response.data.user_id != 0) { // TEST FOR DIFFERENT RESPONSE DATA
            this.router.navigate(['users']); // return to users page after user creation
          } else {
            this.errorMsg = 'Must be manager to create new user';
            return;
          }
        } else {
          this.errorMsg = response.error.message; // if user creation doesn't work, respond with specified response
          return;
        }
      })
    }
    // modal.close() ??? NEED TO FIGURE OUT HOW TO CLOSE MODAL AFTER SUCCESSFULL SER CREATION
  }

}
