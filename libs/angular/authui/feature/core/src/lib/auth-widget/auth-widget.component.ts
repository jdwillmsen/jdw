import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMiniFabButton } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { AuthService, UsersService } from '@jdw/angular-shared-data-access';
import { Router } from '@angular/router';
import { User } from '@jdw/angular-shared-util';
import { MatTooltip } from '@angular/material/tooltip';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-auth-widget',
  imports: [
    CommonModule,
    MatMiniFabButton,
    MatMenu,
    MatIcon,
    MatTooltip,
    MatMenuTrigger,
    MatMenuItem,
  ],
  templateUrl: './auth-widget.component.html',
  styleUrl: './auth-widget.component.scss',
})
export class AuthWidgetComponent implements OnInit, OnDestroy {
  user: User | null = null;
  private usersService = inject(UsersService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private tokenSub?: Subscription;

  get isLoggedIn(): boolean {
    return !!this.authService.getToken();
  }

  get doesIconExist(): boolean {
    return !!this.user?.profile?.icon?.icon;
  }

  ngOnInit() {
    this.tokenSub = this.authService.token$.subscribe((token) => {
      if (token && !this.authService.isTokenExpired(token)) {
        const userId = this.authService.getUserIdFromToken(token);
        if (userId) {
          this.usersService.getUser(userId).subscribe((u) => {
            this.user = u;
          });
        }
      } else {
        this.user = null;
        if (token) {
          this.authService.signOut(false);
        }
      }
    });
  }

  ngOnDestroy() {
    this.tokenSub?.unsubscribe();
  }

  signOut(): void {
    setTimeout(() => {
      this.authService.signOut();
    }, 150); // Slightly longer than mat-menu close animation (usually ~100ms)
  }

  signIn(): void {
    this.router.navigate(['/auth/sign-in']);
  }

  signUp(): void {
    this.router.navigate(['/auth/sign-up']);
  }

  goToAccount(): void {
    this.router.navigate([`/users/user/${this.user?.id}`]);
  }
}
