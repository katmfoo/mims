import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.page.html',
  styleUrls: ['./product-details.page.scss'],
})
export class ProductDetailsPage implements OnInit {
  public item_code;

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.item_code = this.route.snapshot.params.itemCode;
    console.log(this.item_code);
  }

}

