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
  public selectedUser;

  constructor(private apiCall: ApiCallService, private modalService: NgbModal, private router: Router) {}

  ngOnInit() {
    this.updateUsers();
  }

  logout() {
    // logout current user
    localStorage.removeItem('access-token');
    this.router.navigate(['login']);
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

  openEditModal(content, username) {
    this.selectedUser = username;
    this.open(content);
  }

  deleteUser(user_id, username) {
    // make sure a user can't delete themselves
    // store current user after they log in to the user-management-page
    console.log(username);
    console.log(user_id);
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
