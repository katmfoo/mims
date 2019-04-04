import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiCallService } from '../services/api-call.service';
import { AlertController } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import * as moment from 'moment'

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
})
export class ProductDetailsPage implements OnInit {

  public current_tab = 'details';

  public item_code;
  public item;
  public movement = [];

  constructor(private route: ActivatedRoute, private apiCall: ApiCallService, private alertController: AlertController, private navCtrl: NavController) {}

  ngOnInit() {
    this.item_code = this.route.snapshot.params.itemCode; 
    this.downloadProduct();
    this.downloadMovement();
  }

  downloadProduct() {
    this.apiCall.get('/products/' + this.item_code + '/', {}).then((response: any) => {
      if (response.success) {
        this.item = response.data.product;
      }
    });
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

  async addInventory(item_code) {
    const alert = await this.alertController.create({
      header: 'Add Inventory',
      inputs: [
        {
          name: 'amount',
          type: 'number',
        }
      ],
      buttons: [  
        {
          text: 'Add Inventory',
          handler: (data) => {
            if (data.amount) {
              let date_string = this.getDateTimeMySql();
              let unit_id = null;
              if (this.item.unit == 'Unit') {
                unit_id = 1;
              } else if (this.item.unit == 'Pound') {
                unit_id = 2;
              }
              this.apiCall.post('/inventory/', {
                'item_code': item_code,
                'amount': Number(data.amount),
                'unit': unit_id,
                'datetime': date_string
              }).then(() => {
                this.downloadProduct();
              });
            }
          }
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            
          }
        } 
      ]
    });

    await alert.present();
  }

  getDateTimeMySql() {
    let date = new Date();
    let date_string = new Date().getUTCFullYear() + '-' +
      ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
      ('00' + date.getUTCDate()).slice(-2) + ' ' + 
      ('00' + date.getUTCHours()).slice(-2) + ':' + 
      ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
      ('00' + date.getUTCSeconds()).slice(-2);
    return date_string;
  }

  goBack() {
    this.navCtrl.navigateBack('product-search');
  }

  segmentChanged(value) {
    this.current_tab = value.detail.value;
  }
}






