import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'login-page', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'login-page', loadChildren: './login-page/login-page.module#LoginPagePageModule' },
  { path: 'product-info', loadChildren: './product-info/product-info.module#ProductInfoPageModule' },
  { path: 'movement', loadChildren: './movement/movement.module#MovementPageModule' },
  { path: 'forecast', loadChildren: './forecast/forecast.module#ForecastPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
