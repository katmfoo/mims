import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiCallService } from '../services/api-call.service';
import * as moment from 'moment'
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-product-movement',
  templateUrl: './product-movement.page.html',
  styleUrls: ['./product-movement.page.scss'],
})
export class ProductMovementPage implements OnInit {
  public item_code;
  public item;

  public movement = [];

  constructor(private route: ActivatedRoute, private apiCall: ApiCallService, private navCtrl: NavController) { }

  ngOnInit() {
    this.item_code = this.route.snapshot.params.itemCode;
    this.downloadMovement();
    this.downloadProduct();
  }


  downloadMovement() {
    this.apiCall.get('/products/' + this.item_code + '/movement/', {}).then((response: any) => {
      if (response.success) {

        for (let item in response.data.product_movement) {
          this.movement.unshift({
            'date': moment(item),
            'inventory_amount': response.data.product_movement[item]
          });
        }

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

  goBack() {
    this.navCtrl.navigateBack('product-details' + '/' + this.item_code);
  }
}
