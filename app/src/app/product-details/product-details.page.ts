import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiCallService } from '../services/api-call.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
})
export class ProductDetailsPage implements OnInit {
  public item_code;
  public item;

  constructor(private route: ActivatedRoute, private apiCall: ApiCallService, private alertController: AlertController) { }

  ngOnInit() {
    this.item_code = this.route.snapshot.params.itemCode;
    console.log(this.item_code);

        
      this.downloadProduct();
    
  }

  downloadProduct() {
    this.apiCall.get('/products/' + this.item_code + '/', {}).then((response: any) => {
      if (response.success) {
        this.item = response.data.product;
        console.log(this.item);
      }
    });
  }


  async addInventory(item_code) {
    const alert = await this.alertController.create({
      header: 'Add Inventory',
      inputs: [
        {
          name: 'amount',
          type: 'number'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            
          }
        }, {
          text: 'Add Inventory',
          handler: (data) => {
            if (data.amount) {
              let date = new Date();
              let date_string = new Date().getUTCFullYear() + '-' +
                  ('00' + (date.getUTCMonth()+1)).slice(-2) + '-' +
                  ('00' + date.getUTCDate()).slice(-2) + ' ' + 
                  ('00' + date.getUTCHours()).slice(-2) + ':' + 
                  ('00' + date.getUTCMinutes()).slice(-2) + ':' + 
                  ('00' + date.getUTCSeconds()).slice(-2);
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
        }
      ]
    });

    await alert.present();
  }

}

