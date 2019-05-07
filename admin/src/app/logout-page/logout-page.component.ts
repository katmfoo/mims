//imports
import { Component, OnInit } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout-page',
  templateUrl: './logout-page.component.html',
  styleUrls: ['./logout-page.component.scss']
})
export class LogoutPageComponent implements OnInit {

  private count : number = 5;

  constructor(private apiCall: ApiCallService, private router: Router) {}

  ngOnInit() { 
      this.countdown(); // begin countdown and adjust HTML
  }

  redirect() {
    this.router.navigate(['login']);
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  async countdown() {
    var timer = document.getElementById("countdown");
    if (this.count > 0) {
      this.count --;
      timer.innerText = this.count.toString();
      await this.delay(1000);
      this.countdown();
    }
    else {
      this.redirect();
    }
  }
}
