//imports
import { Component, OnInit } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.scss']
})
export class LoginPageComponent implements OnInit {

  public username: string;  
  public password: string;
  public errorMsg: string;

  constructor(private apiCall: ApiCallService, private router: Router) {}

  ngOnInit() { }

  login() {
    // Reset error message
    this.errorMsg = "";

    // Ensure both fields are filled out when loggin in
    if (!this.username || !this.password) {
      this.errorMsg = "All fields required";
      return;
    } else {
      this.apiCall.post('/login/', {   //call login api
        username: this.username,
        password: this.password
      }).then((response: any) => {
        if (response.success) {
          if (response.data.user_type == 1) {    //no employees allowed to login
            localStorage.setItem('access-token', response.data.access_token);
            localStorage.setItem('current-username', this.username);
            this.router.navigate(['users']);
          } else {
            this.errorMsg = 'Must be manager to login';   //if employee tries to login
            return;
          }
        } else {
          this.errorMsg = response.error.message;
          return;
        }
      })
    }
  }
}
