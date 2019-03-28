import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiCallService } from '../services/api-call.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
})
export class ProductDetailsPage implements OnInit {
  public item_code;
  public item;

  constructor(private route: ActivatedRoute, private apiCall: ApiCallService) { }

  ngOnInit() {
    this.item_code = this.route.snapshot.params.itemCode;
    console.log(this.item_code);

      if (this.item_code) {
        this.apiCall.get('/products/' + this.item_code + '/', {}).then((response: any) => {
          if (response.success) {
            this.item = response.data.product;
            console.log(this.item);
          }
        });
      }
      
    
  }



}

