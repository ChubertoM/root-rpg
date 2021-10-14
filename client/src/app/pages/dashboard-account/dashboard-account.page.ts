import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { UserAPIService } from '../../services/user.api.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-dashboard-account',
  templateUrl: './dashboard-account.page.html',
  styleUrls: ['./dashboard-account.page.scss'],
})
export class DashboardAccountPage implements OnInit {

  public currentPassword = '';
  public newPassword = '';

  public passwordForm = new FormGroup({
    currentPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [Validators.required])
  });

  constructor(
    private alert: AlertController,
    private router: Router,
    public api: UserAPIService,
    private notify: NotificationService
  ) { }

  ngOnInit() {
  }

  async logout() {
    const alert = await this.alert.create({
      header: 'Log Out',
      message: `Are you sure you want to log out?`,
      buttons: [
        'Cancel',
        {
          text: 'Yes, log out',
          handler: () => {
            this.api.logout();
            this.router.navigate(['/login']);

            this.notify.notify('You have been successfully logged out!');
          }
        }
      ]
    });

    alert.present();
  }

  async changePassword() {
    const alert = await this.alert.create({
      header: 'Change Password',
      message: `Are you sure you want to change your password?`,
      buttons: [
        'Cancel',
        {
          text: 'Yes, change password',
          handler: () => {
            console.log(this.passwordForm.get('currentPassword').value, this.passwordForm.get('newPassword').value);
            this.notify.notify('Your password has been changed!');
          }
        }
      ]
    });

    alert.present();
  }

}
