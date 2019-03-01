import { Component, OnInit } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';

@Component({
  selector: 'app-user-management-page',
  templateUrl: './user-management-page.component.html',
  styleUrls: ['./user-management-page.component.scss']
})
export class UserManagementPageComponent implements OnInit {

  public users: Array<any> = [];
  public data: any = {page_size: 10, page: 1};
  public search_term: string;

  constructor(private apiCall: ApiCallService) {}

  ngOnInit() {
    this.updateUsers();
  }

  updateUsers() {
    this.apiCall.get('/users/', this.data).then((response: any) => {
      if (response.success) {
        this.users = response.data.items;
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
}
