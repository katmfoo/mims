import { Component, Directive, Input, ViewChild } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';
import { AlertController, Platform } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import * as moment from 'moment';
import { BaseChartDirective, ChartsModule } from 'ng2-charts/ng2-charts';
import { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } from 'constants';


@Component({
  selector: 'app-product-search',
  templateUrl: './product-search.page.html',
  styleUrls: ['./product-search.page.scss'],
})



export class ProductSearchPage {
  @ViewChild(BaseChartDirective) chart: BaseChartDirective;
  public searching: boolean = true;
  public search_no_results: boolean = false;
  public empty_search: boolean = true;
  public items = [];

  public search_loading: boolean = false;
  public product_loading: boolean = false;
  public movement_loading: boolean = false;
  public forecast_loading: boolean = false;

  public d = new Date();
  public current_tab = 'details';
  public filtered;
  public item_code;
  public item;
  public movement = [];
  public forecast = [];
  public movementValues = [];
  public forecastValues = [];
  public lastWeek = [];
  public nextWeek = [];
  public currentDay = this.d.getDay();
  public is_cordova: boolean = false;

  public movement_display = 'table';
  public forecast_display = 'table';

  constructor(private apiCall: ApiCallService, private alertController: AlertController, private navCtrl: NavController, private platform: Platform, private barcodeScanner: BarcodeScanner) {
    this.is_cordova = this.platform.is('cordova');
  }

  searchProduct(event) {
    const search_term = event.detail.value;
    if (search_term) {
      this.search_loading = true;
      this.searching = true;
      this.empty_search = false;
      this.apiCall.get('/products/', {search_term: search_term}).then((response: any) => {
        if (response.success) {
          this.items = response.data.products;
          if (this.items.length == 0) {
            this.search_no_results = true;
          } else {
            this.search_no_results = false;
          }
          this.search_loading = false;
        }
      });
    } else {
      this.items = [];
      this.empty_search = true;
      this.search_no_results = false;
    }
  }

  selectProduct(item_code) {
    this.item_code = item_code;
    this.downloadProduct();
    this.searching = false;
    this.current_tab = 'details';
  }

  downloadProduct() {
    this.product_loading = true;
    this.movement_loading = true;
    this.forecast_loading = true;

    // Download product data
    this.apiCall.get('/products/' + this.item_code + '/', {}).then((response: any) => {
      if (response.success) {
        this.item = response.data.product;
        this.product_loading = false;
      }
    });

    // Download movement data
    this.apiCall.get('/products/' + this.item_code + '/movement/', {}).then((response: any) => {
      if (response.success) {

        this.movementValues = [];
        this.movement = [];
        for (let item in response.data.product_movement) {
          this.movement.unshift({
            'date': moment(item),
            'amount': response.data.product_movement[item]
          });
        }

    
        this.movementValues = this.movement.map(element => element.amount).reverse();
        this.drawChart();
        this.movement_loading = false;
      }
    });

    // Download forecast data
    this.apiCall.get('/products/' + this.item_code + '/forecast/', {}).then((response: any) => {
      if (response.success) {

        this.forecast = [];
        for (let item in response.data.product_forecast) {
          this.forecast.push({
            'date': moment(item),
            'amount': response.data.product_forecast[item]
          });
        }

        this.forecastValues = this.forecast.map(element => element.amount);
        this.drawChart();
        this.forecast_loading = false; 
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
    console.log(date_string);
    return date_string;
  }

    
  goBack() {
    this.navCtrl.navigateBack('product-search');
  }

  segmentChanged(value) {
    this.current_tab = value.detail.value;
  }

  scanBarcode() {
    this.barcodeScanner.scan().then(barcodeData => {
      if (barcodeData.text) {
        this.searching = false;
        this.current_tab = 'details';
        this.product_loading = true;
        this.apiCall.get('/products/', {barcode: barcodeData.text}).then((response: any) => {
          if (response.success) {
            if (response.data.products[0]) {
              this.item_code = response.data.products[0].item_code;
              this.downloadProduct();
            }
          }
        });
      }
    });
  }
  
  searchFocused() {
    this.searching = true;
  }

  movementDisplayChanged(value) {
    this.movement_display = value.detail.value;
  }

  forecastDisplayChanged(value) {
    this.forecast_display = value.detail.value;
  }
  
  //This is where we have to put movement variable
  // Where the array of [1,5,2,8,9,4] is
  public forecastChartData:Array<any> = [
    {data: this.forecastValues, label: 'Forecast'}
  ];

  public movementChartData:Array<any> = [
    {data: this.movementValues, label: 'Movement'},
  ];
  public movementChartLabels:Array<string> = [];
  public forecastChartLabels:Array<string> = [];
  public lineChartOptions:any = {
    responsive: true
  };
  public lineChartColors:Array<any> = [
    { // Ionic default blue
      backgroundColor: 'rgba(55,128,255,0.2)',
      borderColor: 'rgba(55,128,255,1)',
      pointBackgroundColor: 'rgb(31,79,255,0.8)',
      pointBorderColor: 'rgb(31,79,255,1)',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    }
  ];
  public lineChartLegend:boolean = true;
  public lineChartType:string = 'line';
  
  // events
  public chartClicked(e:any):void {
    console.log(e);
  }
  
  public formWeeks() {
    var i: number;
    for(i = 0; i < 8; i++){
      this.lastWeek[i] = moment().subtract((7-i), 'days').format('M/DD');
    }
    
    for(i = 0; i < 8; i++){
      this.nextWeek[i] = moment().add((0+i), 'days').format('M/DD');
    }
  }

  public buildString(weekday: string, formatedDate: string){
    return weekday + " (" + formatedDate + ")";
  }

  public setLabelHelper(flag: number, pos: number){
    if(flag == 0){
      return this.lastWeek[pos];
    }
    else{
      return this.nextWeek[pos];
    }
  }

  public setLabel(flag: number){
    var i = 0;
    var pos = 0;
    var returnArray = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if(flag==1){
      returnArray[0] = "Today"
      pos = new Date().getDay() + 1;
      //sends the short hand weekday to be built as a string with the short hand date in format "Mon (4/28)"
      for(i = 1; i < 8; i++){
        returnArray[i] = this.buildString(weekDays[(pos % weekDays.length)], this.setLabelHelper(flag, i));
        pos++;
      }
    }
    else{
      returnArray[7] = "Today"
      pos = new Date().getDay();
      for(i = 0; i < 7; i++){
        returnArray[i] = this.buildString(weekDays[(pos % weekDays.length)], this.setLabelHelper(flag, i));
        pos++;
      }
    }
    return returnArray;
  }

  public chartHovered(e:any):void {
    console.log(e);
  }
  
  public drawChart(){
    this.formWeeks();
    this.movementChartData = [{data: this.movementValues, label: 'Movement'}];
    this.forecastChartData = [{data: this.forecastValues, label: 'Forecast'}];
    this.movementChartLabels = this.setLabel(0);
    this.forecastChartLabels = this.setLabel(1);
  }
}






