import { Component, inject, OnInit, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemePalette } from '@angular/material/core';
import { MatDrawerMode } from '@angular/material/sidenav';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import {
  HeaderComponent,
  NavigationLayoutComponent,
} from '@jdw/angular-shared-ui';
import { RouterOutlet } from '@angular/router';
import {
  Environment,
  ENVIRONMENT,
  NavigationItem,
} from '@jdw/angular-shared-util';
import { MatButton } from '@angular/material/button';
import {
  MicroFrontendService,
  VersionService,
} from '@jdw/angular-container-data-access';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { MatTooltip } from '@angular/material/tooltip';

@Component({
  selector: 'jdw-main',
  imports: [
    CommonModule,
    HeaderComponent,
    NavigationLayoutComponent,
    RouterOutlet,
    MatButton,
    MatTooltip,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
})
export class MainComponent implements OnInit {
  appTitle = 'JDW';
  appRouterLink = '/';
  appTooltip = 'Home';
  headerColor: ThemePalette = 'primary';
  isXSmallScreen = false;
  isSideNavOpened = false;
  sideNavMode: MatDrawerMode = 'side';
  isSideNavEnabled = true;
  navigationItems: NavigationItem[] = [];
  currentVersion = '';
  headerWidgets: Type<unknown>[] = [];
  private environment: Environment = inject(ENVIRONMENT);
  private breakpointObserver: BreakpointObserver = inject(BreakpointObserver);
  private versionService: VersionService = inject(VersionService);

  private microFrontendService: MicroFrontendService =
    inject(MicroFrontendService);

  private loadRemoteWidgets(): void {
    this.microFrontendService.getComponentRemotes().subscribe({
      next: (remotes) => {
        remotes.forEach((remote) => {
          loadRemote<any>(remote.id).then((module) => {
            const component = module[remote.name];
            if (component) {
              this.headerWidgets.push(component);
            }
          });
        });
      },
    });
  }

  get currentEnv() {
    return this.environment.ENVIRONMENT;
  }

  ngOnInit() {
    this.breakpointObserver.observe(Breakpoints.XSmall).subscribe((result) => {
      this.isXSmallScreen = result.matches;
      this.updateNavigationBasedOnScreenSize();
    });
    this.versionService.getVersion().subscribe((version) => {
      this.currentVersion = version;
    });
    this.microFrontendService
      .getNavigationItems()
      .subscribe((navigationItems) => {
        this.navigationItems = [...this.navigationItems, ...navigationItems];
      });
    this.loadRemoteWidgets();
  }

  handleToggle() {
    this.isSideNavOpened = !this.isSideNavOpened;
  }

  sideNavChange(isOpen: boolean) {
    this.isSideNavOpened = isOpen;
  }

  updateNavigationBasedOnScreenSize() {
    if (this.isXSmallScreen) {
      this.sideNavMode = 'over';
      this.isSideNavOpened = false;
    } else {
      this.sideNavMode = 'side';
      this.isSideNavOpened = true;
    }
  }
}
