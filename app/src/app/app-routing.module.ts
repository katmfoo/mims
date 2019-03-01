import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'product', loadChildren: './product-info/product-info.module#ProductInfoPageModule' },
  { path: 'movement', loadChildren: './movement/movement.module#MovementPageModule' },
  { path: 'forecast', loadChildren: './forecast/forecast.module#ForecastPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
