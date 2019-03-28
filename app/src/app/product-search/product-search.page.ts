import { Component } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-product-search',
  templateUrl: 'product-search.page.html',
  styleUrls: ['product-search.page.scss'],
})
export class ProductSearchPage {

  public items: Array<any> = [];
  public search_term: string;

  constructor(private apiCall: ApiCallService, private navCtrl: NavController) {}

  search() {
    if (this.search_term) {
      this.apiCall.get('/products/', {search_term: this.search_term}).then((response: any) => {
        if (response.success) {
          this.items = response.data.products;
        }
      });
    }
  }

  navigate(item_code) {
    //this.navCtrl.navigateRoot('product-details');
    this.navCtrl.navigateForward('product-details/' + item_code);
  }
}