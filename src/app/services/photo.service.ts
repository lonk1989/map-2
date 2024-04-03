import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Filesystem, Directory, ReaddirResult } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { allTypes, allTypes1, allTypes21 } from '../page-take-photo/page-take-photo.config';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  public fileGroup: any = [];
  public pointName = '';
  public type1Select = '01';
  public type2Select = '01';
  public type1Options = allTypes1;
  public type2Options = allTypes21;
  public photos: UserPhoto[] = [];
  private PHOTO_STORAGE: string = 'photo';
  private POINT_NAME_STORAGE: string = 'point-name';
  private TYPE1_STORAGE: string = 'type1';
  private TYPE2_STORAGE: string = 'type2';
  private currentLimit = 20;

  constructor(private datePipe: DatePipe) { }

  public typeChange() {
    this.currentLimit = 20;
    this.type2Options = allTypes['allTypes2' + this.type1Select]

    Preferences.set({
      key: `${this.TYPE1_STORAGE}`,
      value: this.type1Select,
    });
    Preferences.set({
      key: `${this.TYPE2_STORAGE}`,
      value: this.type2Select,
    });
    this.loadSaved();
  }

  public async addNewToGallery() {
    // Take a photo
    const capturedPhoto = await Camera.getPhoto({
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
      quality: 100
    });

    const savedImageFile = await this.savePicture(capturedPhoto);
    this.photos.unshift(savedImageFile);

    Preferences.set({
      key: `${this.PHOTO_STORAGE}-${this.type1Select}-${this.type2Select}`,
      value: JSON.stringify(this.photos.map((photo) => photo.filepath)),
    });

    this.incPointName();
  }

  async renamePicture(photo: UserPhoto, index: number, name: string) {
    await Filesystem.rename({
      from: photo.filepath,
      to: name,
      directory: Directory.ExternalStorage
    })

    this.photos[index].filepath = name;

    await Preferences.set({
      key: `${this.PHOTO_STORAGE}-${this.type1Select}-${this.type2Select}`,
      value: JSON.stringify(this.photos.map((photo) => photo.filepath)),
    });
  }

  async deletePicture(photo: UserPhoto, index: number) {
    this.photos.splice(index, 1);

    await Preferences.set({
      key: `${this.PHOTO_STORAGE}-${this.type1Select}-${this.type2Select}`,
      value: JSON.stringify(this.photos.map((photo) => photo.filepath)),
    });

    await Filesystem.deleteFile({
      path: photo.filepath,
      directory: Directory.ExternalStorage
    })
  }

  public async fileStatistics() {
    const fileGroup: FileGroupMap = {};
    const result = await Filesystem.readdir({
      path: '',
      directory: Directory.External
    })
    if (Array.isArray(result?.files)) {
      result.files.forEach(file => {
        const createDate = this.datePipe.transform(file.ctime, 'yyyy年MM月dd日') ?? '';
        if (!fileGroup[createDate]) {
          fileGroup[createDate] = 1;
        } else {
          fileGroup[createDate] += 1;
        }
      })
    }
    this.fileGroup = Object.keys(fileGroup).map(key => ({ createDate: key, count: fileGroup[key] }))
  }

  async loadSaved(isFirst?: boolean) {
    if (isFirst) {
      const value1 = await Preferences.get({ key: `${this.TYPE1_STORAGE}` });
      this.type1Select = value1?.value ?? '';

      const value2 = await Preferences.get({ key: `${this.TYPE2_STORAGE}` });
      this.type2Select = value2?.value ?? '';

      const pointName = await Preferences.get({ key: `${this.POINT_NAME_STORAGE}` });
      this.pointName = pointName?.value ?? '';

      this.type2Options = allTypes['allTypes2' + this.type1Select]
    }

    // Retrieve cached photo array data
    const { value } = await Preferences.get({ key: `${this.PHOTO_STORAGE}-${this.type1Select}-${this.type2Select}` });
    this.photos = (value ? JSON.parse(value).map((str: any) => ({ filepath: str })) : []) as UserPhoto[];
    // Display the photo by reading into base64 format
    for (let photo of this.photos.slice(0, 20)) {
      // Read each saved photo's data from the Filesystem
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.ExternalStorage,
      });

      // Web platform only: Load the photo as base64 data
      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }
  }

  async loadByScroll(scrollY: number) {
    const currentLimit = this.currentLimit;
    const nextLimit = 20 + Math.floor(scrollY / 60);
    this.currentLimit = nextLimit;
    for (let photo of this.photos.slice(currentLimit, nextLimit)) {
      // Read each saved photo's data from the Filesystem
      const readFile = await Filesystem.readFile({
        path: photo.filepath,
        directory: Directory.ExternalStorage,
      });

      // Web platform only: Load the photo as base64 data
      photo.webviewPath = `data:image/jpeg;base64,${readFile.data}`;
    }
  }

  private incPointName() {
    this.pointName = this.pointName.replace(/\d+$/, (match: string) => {
      if (match.indexOf('0') === 0) {
        return String(Number('1' + match) + 1).substring(1);
      }
      return String(Number(match) + 1);
    })

    Preferences.set({
      key: `${this.POINT_NAME_STORAGE}`,
      value: this.pointName,
    });
  }

  private async savePicture(photo: Photo) {
    // Convert photo to base64 format, required by Filesystem API to save
    const base64Data = await this.readAsBase64(photo);

    // Write the file to the data directory
    const fileName = `${this.pointName}-${this.type1Select}${this.type2Select}-${this.datePipe.transform(Date.now(), 'yyyyMMddHHmmssSSS')}.jpeg`;
    const savedFile = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.ExternalStorage
    });
    // Use webPath to display the new image instead of base64 since it's
    // already loaded into memory
    return {
      filepath: fileName,
      webviewPath: photo.webPath
    };
  }

  private async readAsBase64(photo: Photo) {
    // Fetch the photo, read as a blob, then convert to base64 format
    const response = await fetch(photo.webPath!);
    const blob = await response.blob();

    return await this.convertBlobToBase64(blob) as string;
  }

  private convertBlobToBase64 = (blob: Blob) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.readAsDataURL(blob);
  });
}

export interface UserPhoto {
  filepath: string;
  webviewPath?: string;
}

export interface FileGroup {
  createDate: string;
  count: number;
}

export interface FileGroupMap {
  [prop: string]: number;
}