import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthWidgetComponent } from './auth-widget.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ENVIRONMENT } from '@jdw/angular-shared-util';

describe('AuthWidgetComponent', () => {
  let component: AuthWidgetComponent;
  let fixture: ComponentFixture<AuthWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthWidgetComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ENVIRONMENT,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AuthWidgetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
