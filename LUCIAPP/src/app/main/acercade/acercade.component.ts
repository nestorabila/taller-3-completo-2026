import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-acercade',
  templateUrl: './acercade.component.html',
   standalone: true,
      imports: [CommonModule, RouterModule,  FormsModule],
  styleUrls: ['./acercade.component.scss'],
})
export class AcercadeComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
