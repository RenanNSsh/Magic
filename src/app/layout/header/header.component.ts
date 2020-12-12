import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'magic-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  title = 'Magic'

  constructor() { }

  ngOnInit(): void {
  }

}
