import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PageGalleryComponent } from './page-gallery.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: PageGalleryComponent,
  }
];

@NgModule({
  declarations: [PageGalleryComponent],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    IonicModule
  ]
})
export class PageGalleryModule { }
