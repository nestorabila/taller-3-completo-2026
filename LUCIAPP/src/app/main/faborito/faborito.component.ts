import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-faborito',
  templateUrl: './faborito.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule,  FormsModule],
  styleUrls: ['./faborito.component.scss'],
})
export class FaboritoComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
