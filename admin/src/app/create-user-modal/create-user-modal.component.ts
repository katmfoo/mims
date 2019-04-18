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

    // Ensure all fields are filled out
    if (!this.username || !this.password || !this.type || !this.confirm_password || !this.first_name || !this.last_name) {
      this.errorMsg = "All fields required";
      return;
    } else if (this.password != this.confirm_password) { // != or some method?
      this.errorMsg = "Passwords must match";
    } else {
      // generateUser()
      this.apiCall.post('/users/', { // users.py POST method creates users
        username: this.username,      // MUST BE IN ORDER: username, first_name, last_name, password, type
        first_name: this.first_name,
        last_name: this.last_name,
        password: this.password,
        type: Math.floor(this.type.valueOf()) // convert the value of 'type' to an "int"
      }).then((response: any) => { 
        if (response.success) {
            this.modal.close();
            return;
        } else {
          this.errorMsg = response.error.message; // if user creation doesn't work, respond with specified response
          return;
        }
      })
    }
  }

  generateUser(short_name) { // short_name = first initial of first name + shortened last name
    // add number at end of short_name (starting at 0,) attempt user creation
    // if failure, increment number, try again
    var generated_name_and_number = "foobar4";
    var increment_short_name = true;

    while (increment_short_name) {
      this.apiCall.post('/users/', { // users.py POST method creates users
        username: generated_name_and_number,      // MUST BE IN ORDER: username, first_name, last_name, password, type
        first_name: this.first_name,
        last_name: this.last_name,
        password: this.password,
        type: Math.floor(this.type.valueOf()) // convert the value of 'type' to an "int"
      }).then((response: any) => { 
        if (response.success) {
            increment_short_name = false;
            this.modal.close();
            return;
        } else if (response.error.message = "Bad Username") { // username taken
          // increment the short name (will loop automatically)
        }
        else {
          this.errorMsg = response.error.message; // if user creation doesn't work, respond with specified response
          increment_short_name = false;
          return;
        }
      })
    }
    
  }

}
