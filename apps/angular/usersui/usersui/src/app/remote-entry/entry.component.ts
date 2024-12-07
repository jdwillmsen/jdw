import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  imports: [CommonModule, RouterOutlet],
  selector: 'app-usersui-entry',
  template: `<router-outlet></router-outlet>`,
})
export class RemoteEntryComponent {}
