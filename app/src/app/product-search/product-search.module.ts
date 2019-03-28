import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule, Router } from '@angular/router';

import { ProductSearchPage } from './product-search.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild([
      {
        path: '',
        component: ProductSearchPage
      }
    ])
  ],
  declarations: [ProductSearchPage]
})
export class ProductSearchPageModule {

constructor(private router: Router)
  {

  }

  loginListener()
  {
    this.router.navigate(['home']);
  }

}