import { Component, OnInit } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout-page',
  templateUrl: './logout-page.component.html',
  styleUrls: ['./logout-page.component.scss']
})
export class LogoutPageComponent implements OnInit {

  public username: string;
  public password: string;
  public errorMsg: string;

  constructor(private apiCall: ApiCallService, private router: Router) {}

  ngOnInit() {}


logout() {
  // logout current user
  localStorage.removeItem('access-token');
  this.router.navigate(['login']); // TODO: navigate to new logout page
}}