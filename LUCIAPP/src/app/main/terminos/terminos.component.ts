import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terminos',
  templateUrl: './terminos.component.html',
   standalone: true,
    imports: [CommonModule, RouterModule,  FormsModule],
  styleUrls: ['./terminos.component.scss'],
})
export class TerminosComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
