import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { NgTableComponent, NgTableFilteringDirective, NgTablePagingDirective, NgTableSortingDirective } from 'ng2-table/ng2-table';
import { CurrencyMaskModule } from "ng2-currency-mask";
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component'
import { NodeManagerComponent } from './node-manager/node-manager.component'

import { AppComponent } from './app.component';
import { AppService } from './app.service';

const appRoutes: Routes = [
  { path: 'node-manager', component: NodeManagerComponent },
  { path: '', component: LoginComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  declarations: [
    AppComponent,
    NodeManagerComponent,
    LoginComponent,
    NgTableComponent,
    NgTableFilteringDirective,
    NgTablePagingDirective,
    NgTableSortingDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    CurrencyMaskModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [
    AppService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
