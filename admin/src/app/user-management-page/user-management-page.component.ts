//imports
import { Component, OnInit } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-management-page',
  templateUrl: './user-management-page.component.html',
  styleUrls: ['./user-management-page.component.scss']
})
export class UserManagementPageComponent implements OnInit {

  public users: Array<any> = [];
  public data: any = {page_size: 10, page: 1};
  public search_term: string;  //search users on user management page
  public selectedUser: string; // used for opening the edit modal

  constructor(private apiCall: ApiCallService, private modalService: NgbModal, private router: Router) {}

  ngOnInit() {
    this.updateUsers(); //update users after changes
    this.setUpUsername(); 
  }

  logout() {
    localStorage.removeItem('access-token');
    localStorage.removeItem('current-username');
    this.router.navigate(['logout']); //navigate to login after calling logout function
  }

  updateUsers() {  //any changes on users
    this.apiCall.get('/users/', this.data).then((response: any) => {  //api call 
      if (response.success) {
        this.users = response.data.users;
      }
    });
  }

  searchUsers() {   //see if search term appears in data
    if (this.search_term) { 
      this.data.page = 1;
      this.data.search_term = this.search_term;
    } else {
      delete this.data.search_term; 
    }
    this.updateUsers();
  }

  nextPage() {  //go to the next page once next page button is pressed
    if (!this.nextDisabled()) {
      this.data.page += 1;
      this.updateUsers();
    }
  }

  previousPage() {    // go to previous page once previous page button is pressed
    if (!this.previousDisabled()) {
      this.data.page -= 1;
      this.updateUsers();
    }
  }

  nextDisabled() {    //disable next page button if the page isn't filled
    return this.users.length < this.data.page_size;
  }

  previousDisabled() {  //disable previous page if theres no previous page
    return this.data.page <= 1;
  }

  open(content) {
    let ngbModalOptions: NgbModalOptions = {
      backdrop : 'static',
      keyboard : false,
      ariaLabelledBy : 'modal-basic-title'
    };
    this.modalService.open(content, ngbModalOptions).result.then((result) => {
      this.updateUsers();
    }, (reason) => {
      console.log('rejected');
    });
    this.updateUsers();
  }

  openEditModal(content, username : string) {  //open edit modal after edit is clicked
    this.selectedUser = username;
    var edit_permission : Boolean = true;
    //check if a user is about to edit their own info and give them a warning
    if (username.toLowerCase() == localStorage.getItem('current-username').toLowerCase()) {
      edit_permission = confirm("You are about to edit your own user information. Do you wish to continue?"
        + "\nNote: editing your own information may cause issues with your permission on this page.");
    }
    if (edit_permission) {
      this.open(content);
    }
  }

  deleteUser(user_id, username : string) {
    //delete a user. Checks to see if the user is trying to delete their own account and doesn't let them
    if (username.toLowerCase() == localStorage.getItem('current-username').toLowerCase()) {
      alert("Unable to delete user.This user is currently logged in.");
      return;
    }
    else {
      //or lets them delete a user after confirmation
      var response = confirm("Are you sure you want to delete user: " + username + "?");
      if (response) {
        this.apiCall.put('/users/' + user_id + '/', {
          is_deleted: true
        }).then((response) => {
          this.updateUsers();
          alert(username + " has been deleted.");
        })
      }
    }
  }

  setUpUsername() {
    this.apiCall.get('/users/', {username: localStorage.getItem('current-username')}).then((response: any) => {
      console.log(response);
      console.log(response.data.users[0]);
      let user = response.data.users[0];
      document.getElementById("userBtn").innerText = user.username;
      localStorage.setItem('current-username', user.username);
    });
  }
}
