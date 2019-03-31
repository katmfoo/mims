import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiCallService } from '../services/api-call.service';
import { utils } from 'protractor';

@Component({
  selector: 'app-product-movement',
  templateUrl: './product-movement.page.html',
  styleUrls: ['./product-movement.page.scss'],
})
export class ProductMovementPage implements OnInit {
  public item_code;
  public item;
  public movement;
  public movementKeys: Array<any> = [];
  public movementValues: Array<any> = [];
  public movementDays: Array<any> = [];

  constructor(private route: ActivatedRoute, private apiCall: ApiCallService) { }

  ngOnInit() {

    this.item_code = this.route.snapshot.params.itemCode;
    console.log(this.item_code);

    this.downloadMovement();
    this.downloadProduct();
  }


  downloadMovement() {
    this.apiCall.get('/products/' + this.item_code + '/movement/', {}).then((response: any) => {
      if (response.success) {
        this.movement = response.data.product_movement;
        this.movementKeys = Object.keys(this.movement);
        this.movementValues = Object.values(this.movement);
        this.movementKeys = this.movementKeys.slice(this.movementKeys.length - 7, this.movementKeys.length + 1);
        this.movementValues = this.movementValues.slice(this.movementValues.length - 7, this.movementValues.length + 1);
        this.toDayofWeek();
        console.log(this.movementDays);
        }
        

      
    });
  }

  downloadProduct() {
    this.apiCall.get('/products/' + this.item_code + '/', {}).then((response: any) => {
      if (response.success) {
        this.item = response.data.product;
        console.log(this.item);
      }
    });
  }

  toDayofWeek() {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    for (let i = 0; i < this.movementKeys.length; i++) {
    var d = new Date(this.movementKeys[i]);
    this.movementDays[i] = days[d.getDay()];
    }
  }

}
