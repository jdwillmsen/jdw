import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DialogData, UserDialogComponent } from './user-dialog.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from '@jdw/angular-usersui-util';

const mockData: DialogData & User = {
  title: 'Delete User',
  type: 'readonly',
  action: 'delete',
  id: 1,
  emailAddress: 'user@jdwkube.com',
  password: 'P@ssw0rd',
  status: 'ACTIVE',
  roles: [
    {
      userId: 1,
      roleId: 1,
      createdByUserId: 1,
      createdTime: '2024-09-01T10:11:12.000+00:00',
    },
  ],
  profile: {
    id: 1,
    firstName: 'John',
    middleName: 'A',
    lastName: 'Doe',
    birthdate: '1990-01-01',
    userId: 1,
    icon: {
      id: 1,
      profileId: 1,
      icon: '<base64-encode-image>',
      createdByUserId: 1,
      createdTime: '2024-08-09T01:02:34.567+00:00',
      modifiedByUserId: 1,
      modifiedTime: '2024-09-01T10:11:12.000+00:00',
    },
    addresses: [
      {
        id: 1,
        addressLine1: '123 Main St',
        addressLine2: '',
        city: 'Metropolis',
        stateProvince: 'NY',
        postalCode: '12345',
        country: 'USA',
        profileId: 1,
        createdByUserId: 1,
        createdTime: '2024-08-09T01:02:34.567+00:00',
        modifiedByUserId: 1,
        modifiedTime: '2024-09-01T10:11:12.000+00:00',
      },
    ],
    createdByUserId: 1,
    createdTime: '2024-08-09T01:02:34.567+00:00',
    modifiedByUserId: 1,
    modifiedTime: '2024-08-09T01:02:34.567+00:00',
  },
  createdByUserId: 1,
  createdTime: '2024-08-09T01:02:34.567+00:00',
  modifiedByUserId: 1,
  modifiedTime: '2024-08-09T01:02:34.567+00:00',
};

const mockDialogRef = {
  close: jest.fn(),
};

describe('UserDialogComponent', () => {
  let component: UserDialogComponent;
  let fixture: ComponentFixture<UserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserDialogComponent, NoopAnimationsModule],
      providers: [
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: mockData },
        { provide: MatDialogRef, useValue: mockDialogRef },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form correctly', () => {
    expect(component.userForm).toBeDefined();
    expect(component.userForm.get('id')?.value).toEqual(mockData.id);
    expect(component.userForm.get('status')?.value).toEqual(mockData.status);
    expect(component.roles.length).toBe(mockData.roles.length);
    expect(component.addresses.length).toBe(
      mockData?.profile?.addresses.length,
    );
  });

  it('should call dialogRef.close() when close() is called', () => {
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should call dialogRef.close() with form data when action() is called', () => {
    component.action();
    expect(mockDialogRef.close).toHaveBeenCalledWith(mockData);
  });
});
