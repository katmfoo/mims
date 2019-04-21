import { Component, OnInit } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-management-page',
  templateUrl: './user-management-page.component.html',
  styleUrls: ['./user-management-page.component.scss']
})
export class UserManagementPageComponent implements OnInit {

  public users: Array<any> = [];
  public data: any = {page_size: 10, page: 1};
  public search_term: string;
  public selectedUser: string; // used for opening the edit modal

  constructor(private apiCall: ApiCallService, private modalService: NgbModal, private router: Router) {}

  ngOnInit() {
    this.updateUsers();
  }

  logout() {
    // logout current user
    localStorage.removeItem('access-token');
    this.router.navigate(['login']); // TODO: navigate to new logout page
  }

  updateUsers() {
    this.apiCall.get('/users/', this.data).then((response: any) => {
      if (response.success) {
        this.users = response.data.users;
      }
    });
  }

  searchUsers() {
    if (this.search_term) {
      this.data.page = 1;
      this.data.search_term = this.search_term;
    } else {
      delete this.data.search_term;
    }
    this.updateUsers();
  }

  nextPage() {
    if (!this.nextDisabled()) {
      this.data.page += 1;
      this.updateUsers();
    }
  }

  previousPage() {
    if (!this.previousDisabled()) {
      this.data.page -= 1;
      this.updateUsers();
    }
  }

  nextDisabled() {
    return this.users.length < this.data.page_size;
  }

  previousDisabled() {
    return this.data.page <= 1;
  }

  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.updateUsers();
    }, (reason) => {
      console.log('rejected');
    });
  }

  openEditModal(content, username : string) {
    this.selectedUser = username;
    var edit_permission : Boolean = true;
    if (username.toLowerCase() == localStorage.getItem('current-username').toLowerCase()) {
      edit_permission = confirm("You are about to edit your own user information. Do you wish to continue?"
        + "\nNote: editing your own information may cause issues with your permission on this page.");
    }
    if (edit_permission) {
      this.open(content);
    }
  }

  deleteUser(user_id, username : string) {
    if (username.toLowerCase() == localStorage.getItem('current-username').toLowerCase()) {
      alert("Unable to delete user.This user is currently logged in.");
      return;
    }
    else {
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
}
