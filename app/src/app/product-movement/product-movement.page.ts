import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiCallService } from '../services/api-call.service';

@Component({
  selector: 'app-product-movement',
  templateUrl: './product-movement.page.html',
  styleUrls: ['./product-movement.page.scss'],
})
export class ProductMovementPage implements OnInit {
  public item_code;
  public item;
  //public movement;
  public movement: Array<any> = [];

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
        console.log(this.movement);
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

}
