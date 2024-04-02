import { Component, OnInit, ViewChild } from '@angular/core';
import { ActionSheetController, AlertController, IonContent, ModalController } from '@ionic/angular';
import { IonModal } from '@ionic/angular/common';
import { PhotoService, UserPhoto } from '../services/photo.service';
@Component({
  selector: 'app-page-take-photo',
  templateUrl: './page-take-photo.component.html',
  styleUrls: ['./page-take-photo.component.scss'],
})
export class PageTakePhotoComponent implements OnInit {
  @ViewChild('ioncontent') ioncontent!: IonContent;
  @ViewChild('ionmodal') ionmodal!: IonModal;

  presentingElement: HTMLElement | null = null;
  modal = {
    imgSrc: '',
    title: ''
  }
  constructor(public actionSheetController: ActionSheetController, public alertController: AlertController, public modalController: ModalController, public photoService: PhotoService) { }

  async ngOnInit() {
    this.photoService.loadSaved(true);
    this.presentingElement = document.body;
  }

  scrollEnd() {
    this.ioncontent.getScrollElement().then(element => this.photoService.loadByScroll(element.scrollTop))
  }

  typeChange() {
    this.photoService.typeChange();
  }

  addPhotoToGallery() {
    this.photoService.addNewToGallery();
  }

  async showPhoto(photo: UserPhoto) {
    this.modal.imgSrc = photo.webviewPath ?? '';
    this.modal.title = photo.filepath;
    setTimeout(() => {
      this.ionmodal.present();
    }, 0);
  }

  async renamePhoto(photo: UserPhoto, position: number) {
    const alert = await this.alertController.create({
      header: '新文件名',
      inputs: [{
        value: photo.filepath
      }],
      buttons: [{
        text: '取消',
        role: 'cancel',
        handler: () => {
        }
      }, {
        text: '确定',
        role: 'confirm',
        handler: (value) => {
          this.photoService.renamePicture(photo, position, value[0]);
        }
      }]
    })
    await alert.present();
  }

  async deletePhoto(photo: UserPhoto, position: number) {
    const alert = await this.alertController.create({
      header: '是否删除该照片',
      buttons: [{
        text: '取消',
        role: 'cancel',
        handler: () => {
        }
      }, {
        text: '确定',
        role: 'confirm',
        handler: () => {
          this.photoService.deletePicture(photo, position);
        }
      }]
    })
    await alert.present();
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
