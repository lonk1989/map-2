import { Component, OnInit } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ActionSheetController } from '@ionic/angular';
import { PhotoService, UserPhoto } from '../services/photo.service';
@Component({
  selector: 'app-page-take-photo',
  templateUrl: './page-take-photo.component.html',
  styleUrls: ['./page-take-photo.component.scss'],
})
export class PageTakePhotoComponent implements OnInit {


  constructor(public actionSheetController: ActionSheetController, public photoService: PhotoService) { }

  async ngOnInit() {
    await this.photoService.loadSaved(true);
  }

  typeChange() {
    this.photoService.typeChange();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  async showActionSheet(photo: UserPhoto, position: number) {
    const actionSheet = await this.actionSheetController.create({
      header: 'Photos',
      buttons: [{
        text: 'Delete',
        role: 'destructive',
        icon: 'trash',
        handler: () => {
          this.photoService.deletePicture(photo, position);
        }
      }, {
        text: 'Cancel',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          // Nothing to do, action sheet is automatically closed
        }
      }]
    });
    await actionSheet.present();
  }


}
