import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PageTakePhotoComponent } from './page-take-photo.component';
import { IonicModule } from '@ionic/angular';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: PageTakePhotoComponent,
  }
];

@NgModule({
  declarations: [PageTakePhotoComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    FormsModule,
    IonicModule
  ]
})
export class PageTakePhotoModule { }
