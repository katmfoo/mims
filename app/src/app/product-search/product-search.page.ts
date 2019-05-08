import { Component, ViewChild } from '@angular/core';
import { ApiCallService } from '../services/api-call.service';
import { AlertController, Platform } from '@ionic/angular';
import { NavController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import * as moment from 'moment';
import { BaseChartDirective } from 'ng2-charts/ng2-charts';
import { BrowserStack } from 'protractor/built/driverProviders';

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
  public past10ArrayLocal = JSON.parse(localStorage.getItem('past10Array'));
  public past10Array = JSON.parse(localStorage.getItem('past10Array'));
  public lastWeek = [];
  public nextWeek = [];
  public currentDay = this.d.getDay();
  public is_cordova: boolean = false;

  public movement_display = 'table';
  public forecast_display = 'table';

  public inventoryMenu: boolean = false;
  public tempInventory;

  public extraDetails: boolean = false;
  public currentClickedDay;

  constructor(private apiCall: ApiCallService, private alertController: AlertController, private navCtrl: NavController, private platform: Platform, private barcodeScanner: BarcodeScanner) {
    this.is_cordova = this.platform.is('cordova');
  }

  /**
   * Populates a list of items based on the search term that
   * is entered into the seach bar.
   * 
   * @param event value that is assigned to search_term that 
   * is used to populate the list of products with the a value
   * similar to search_term
   */
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

  /**
   * Allows a user to select what product they would
   * like to veiw in more detail
   * 
   * @param item_code value that is used to select what
   * product info will populate the details, history, and
   * forcast screens.
   */
  selectProduct(item_code) {
    this.item_code = item_code;
    this.downloadProduct();
    this.searching = false;
    this.current_tab = 'details';
  }

  /**
   * Downloads the product, movement, and forcast data of
   * an item.
   */
  downloadProduct() {
    this.product_loading = true;
    this.movement_loading = true;
    this.forecast_loading = true;
    

    // Download product data
    this.apiCall.get('/products/' + this.item_code + '/', {}).then((response: any) => {
      if (response.success) {
        this.item = response.data.product;
        //this.buildpast10Array(this.item);
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
        this.movement_loading = false;
        this.setBadgeText();
        
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

  /**
   * Builds the Array of past10Array; past10Array is meant to hold the last 10 items
   * the user has searched for, held within local storage. It is meant to not hold duplicates
   * and put the newest search at the start of the array, and remove 10th element when reaching 10+ items
   * @param item item object found from downloading item data
   */
  buildpast10Array(item){
    //searches array to see if new item_code is found within array, if it is not assign index to -1
    var index = this.past10ArrayLocal.findIndex(x => x.item_code == item.item_code);
    //if item_code is not found within array, execute logic
    if(index === -1){
      //add new item to the start of the array
      this.past10ArrayLocal.unshift(item);
      //if array is now over 10 items long execute
      if(this.past10ArrayLocal.length > 10){
        //remove last element in the array
        this.past10ArrayLocal.pop();
      }
    }
    // Stores values of array in local storage with tag "past10Array"
    localStorage.setItem('past10Array', JSON.stringify(this.past10ArrayLocal));
    // Grabs tag from local storage and reforms into array under name past10Array for use in home page
    this.past10Array = JSON.parse(localStorage.getItem('past10Array'));
  }

  
  
  setBadgeText()
  {
    var label1 = document.getElementById('badge1');
    var label2 = document.getElementById('badge2');
    var label3 = document.getElementById('badge3');
    var label4 = document.getElementById('badge4');
    var label5 = document.getElementById('badge5');
    var label6 = document.getElementById('badge6');
    var label7 = document.getElementById('badge7');
    var label8 = document.getElementById('badge8');
    
    var i = 0;
    var pos = 0;
    var returnArray = [];
    const weekDays = ['Su', 'M', 'Tu', 'W', 'Th', 'F', 'Sa'];

    //returnArray[0] = "Today"
    pos = new Date().getDay();
    //sends the short hand weekday to be built as a string with the short hand date in format "Mon (4/28)"
    for (i = 0; i < 8; i++) {
      //returnArray[i] = this.buildString(weekDays[(pos % weekDays.length)], this.setLabelHelper(flag, i));
      returnArray[i] = (weekDays[(pos % weekDays.length)]);
      pos++;
    }
    if (label1 != null) {
      label1.innerHTML = returnArray[0];
    }
    if (label2 != null) {
      label2.innerHTML = returnArray[1];
    }
    if (label3 != null) {
      label3.innerHTML = returnArray[2];
    }
    if (label4 != null) {
      label4.innerHTML = returnArray[3];
    }
    if (label5 != null) {
      label5.innerHTML = returnArray[4];
    }
    if (label6 != null) {
      label6.innerHTML = returnArray[5];
    }
    if (label7 != null) {
      label7.innerHTML = returnArray[6];
    }
    if (label8 != null) {
      label8.innerHTML = returnArray[7];
    }

  }
/**
   * Updates the inventory of an item in the database.
   */
  updateInventory()
  {
    if (this.tempInventory) {
      let date_string = this.getDateTimeMySql();
      let unit_id = null;
      if (this.item.unit == 'Unit') {
        unit_id = 1;
      } else if (this.item.unit == 'Pound') {
        unit_id = 2;
      }
      this.apiCall.post('/inventory/', {
        'item_code': this.item.item_code,
        'amount': (this.tempInventory-this.item.current_inventory),
        'unit': unit_id,
        'datetime': date_string
      }).then(() => {
        this.downloadProduct();
      });
    }
    this.toggleInventoryMenu();
  }

  /**
   * Toggles the inventory menu to eiter be shown or hidden.
   */
  toggleInventoryMenu()
  {
    this.tempInventory = this.item.current_inventory;
    if (this.inventoryMenu == false)
      this.inventoryMenu = true;
    else
      this.inventoryMenu = false;
  }

  /**
   * Disables the inventory menu when the inventory is not currently being edited.
  */
  disableInventoryMenu()
  {
    this.inventoryMenu = false;
    //console.log(this.inventoryMenu);
  }

  /**
   * Increased the inventory of an item by 1.
  */
  plusButton()
  {
    this.tempInventory++;
  }

  /**
   * Decreases the inventory of an item by 1.
  */
  minusButton()
  {
    this.tempInventory--;
  }

  /**
   * Alerts that outputs a message if a product is not found based on the search term.
  */
  async productNotFound() {
    const alert = await this.alertController.create({
      header: 'Product not found',
      message: 'That product is not in the database.',
      buttons: ['OK']
    });

    await alert.present();
  }

  /**
   * Gets the date and time from the database.
  */
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

  /**
   * Method that navivates back to the product-search page.
  */
  goBack() {
    this.navCtrl.navigateBack('product-search');
  }

  segmentChanged(value) {
    this.current_tab = value.detail.value;
  }

  /**
   * Scans a barcode and calls the api .get fucntion to search
   * for a product within the database.
   */
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
            } else {
              this.searching = true;
              this.product_loading = false;
              this.productNotFound();
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
    this.setBadgeText();
  }

  forecastDisplayChanged(value) {
    this.forecast_display = value.detail.value;
    this.setBadgeText();
  }
  
 
  /**
   * Input array of forecast data for forecast visualization
   */
  public forecastChartData:Array<any> = [
    {data: this.forecastValues, label: 'Forecast'}
  ];

  /**
   * Input array of movement data for movement visualization
   */
  public movementChartData:Array<any> = [
    {data: this.movementValues, label: 'Movement'},
  ];

  /**
   * Array For movement labels. Gets populated with days of weeks
   */
  public movementChartLabels:Array<string> = [];

  /**
   * Array for forecast labels. Gets populated with days of weeks
   */
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
    // builds array for past week in format M/DD
    for(i = 0; i < 8; i++){
      this.lastWeek[i] = moment().subtract((7-i), 'days').format('M/DD');
    }
    // builds array for next week in format M/DD
    for(i = 0; i < 8; i++){
      this.nextWeek[i] = moment().add((0+i), 'days').format('M/DD');
    }
  }

  /**
   * Builds string in format example: Tue (4/22)
   * @param weekday Short hand 3 char weekday (Tue)
   * @param formatedDate short hand 3 char date (4/22)
   */
  public buildString(weekday: string, formatedDate: string){
    return weekday + " (" + formatedDate + ")";
  }

  /**
   * Flag helper for setting label
   * If flag is 0, get date from last week
   * If flag is 1, get date from next week
   * @param flag flag sent from setLabel 
   * @param pos position sent from setLabel
   */
  public setLabelHelper(flag: number, pos: number){
    if(flag == 0){
      return this.lastWeek[pos];
    }
    else{
      return this.nextWeek[pos];
    }
  }

  /**
   * builds the label arrays used in the graphing system. 
   * if flag is 1, builds forecast labels
   * if flag is 0, builds movement labels
   * @param flag 
   */
  public setLabel(flag: number){
    var i = 0;
    var pos = 0;
    var returnArray = [];
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    if(flag==1){
      // sets first label to be "Today" for UX readability
      returnArray[0] = "Today"
      // sets first position to be "tomorrow" since first label has been created
      pos = new Date().getDay() + 1;
      //sends the short hand weekday to be built as a string with the short hand date in format "Mon (4/28)"
      for(i = 1; i < 8; i++){
        //                                modular wrapping of weekday array   gets formatted date
        returnArray[i] = this.buildString(weekDays[(pos % weekDays.length)], this.setLabelHelper(flag, i));
        pos++;
      }
    }
    else{
      // sets last label of array to be "Today" for UX readability
      returnArray[7] = "Today"
      pos = new Date().getDay();
      for(i = 0; i < 7; i++){
        //                                modular wrapping of weekday array   gets formatted date
        returnArray[i] = this.buildString(weekDays[(pos % weekDays.length)], this.setLabelHelper(flag, i));
        pos++;
      }
    }
    return returnArray;
  }

  public chartHovered(e:any):void {
    console.log(e);
  }
  
  // updates chart's labels and data when a product is opened in app
  public drawChart(){
    // creates week array
    this.formWeeks();
    // sets movement data to be updated data from API
    this.movementChartData = [{data: this.movementValues, label: 'Movement'}];
    // sets forecast data to be updated data from API
    this.forecastChartData = [{data: this.forecastValues, label: 'Forecast'}];
    // sets movement chart labels with flag 0
    this.movementChartLabels = this.setLabel(0);
    // sets forecast chart labels with flag 1
    this.forecastChartLabels = this.setLabel(1);
  }

  extraDetailsButton(dayClicked)
  {
    if(!this.extraDetails)
    {
      this.extraDetails = true;
      this.currentClickedDay = dayClicked;
    }
    else
    {
      if(dayClicked == this.currentClickedDay)
        this.extraDetails = false;
      else
      {
        this.currentClickedDay = dayClicked;
        //api call
      }
    }
  }

}






