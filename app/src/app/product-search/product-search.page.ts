import { Component } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';

@Component({
  selector: 'app-product-search',
  templateUrl: 'product-search.page.html',
  styleUrls: ['product-search.page.scss'],
})
export class ProductSearchPage {

  public items: Array<any> = [];
  public search_term: string;

  constructor(private apiCall: ApiCallService) {}

  search() {
    if (this.search_term) {
      this.apiCall.get('/products/', {search_term: this.search_term}).then((response: any) => {
        if (response.success) {
          this.items = response.data.products;
        }
      });
    }
  }
}
