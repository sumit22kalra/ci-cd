import { Component } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-config',
  imports: [],
  templateUrl: './config.html',
  styleUrl: './config.scss',
})
export class Config {
   apiUrl = environment.apiUrl;
}
