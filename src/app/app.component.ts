import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';
import { IpcService } from './ipc.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  userData!: UserDataFromCardReader;
  constructor(private ipcService: IpcService) {}
  ngOnInit(): void {
    this.ipcService.on('newUserData', (ev:any, userData: any) => {
      this.userData = userData;
    });

    interval(500).subscribe(() => {
      this.ipcService.send('checkSmartCardReader');

    })
  }

}

export interface UserDataFromCardReader {
  name: string;
  lastname: string;
  sex: 'M' | 'F';
  releasedDate: Date;
  expirationDate: Date;
  birthDate: Date;
  birthCityCode: string;
  residenceCityCode: string;
  residenceAddress: string;
  fiscalCode: string;
  emitterCode: string;
}
