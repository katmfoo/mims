import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-product-forecast',
  templateUrl: './product-forecast.page.html',
  styleUrls: ['./product-forecast.page.scss'],
})
export class ProductForecastPage implements OnInit {

  public item_code;

  constructor(private navCtrl: NavController, private route: ActivatedRoute) { }

  ngOnInit() {
    this.item_code = this.route.snapshot.params.itemCode;
  }

  goBack()
  {
    this.navCtrl.navigateBack('product-details' + '/' + this.item_code);
  }

}
