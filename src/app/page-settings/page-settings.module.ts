import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PageSettingsComponent } from './page-settings.component';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: PageSettingsComponent,
  }
];

@NgModule({
  declarations: [PageSettingsComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    IonicModule
  ]
})
export class PageSettingsModule { }
