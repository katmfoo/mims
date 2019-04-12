import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ProductSearchPage } from './product-search.page';

import { ChartsModule } from 'ng2-charts';

const routes: Routes = [
  {
    path: '',
    component: ProductSearchPage
  }
];

@NgModule({
  imports: [ChartsModule,
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ProductSearchPage]
})
export class ProductSearchPageModule {}
