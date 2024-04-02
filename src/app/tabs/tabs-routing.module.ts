import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'page-take-photo',
        loadChildren: () => import('../page-take-photo/page-take-photo.module').then(m => m.PageTakePhotoModule)
      },
      {
        path: 'page-gallery',
        loadChildren: () => import('../page-gallery/page-gallery.module').then(m => m.PageGalleryModule)
      },
      {
        path: 'page-settings',
        loadChildren: () => import('../page-settings/page-settings.module').then(m => m.PageSettingsModule)
      },
      {
        path: '',
        redirectTo: '/tabs/page-take-photo',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/page-take-photo',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
