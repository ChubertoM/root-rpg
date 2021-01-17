import { Component, OnInit } from '@angular/core';
import { ActionSheetController, AlertController, PopoverController } from '@ionic/angular';
import { ICampaign } from '../../../interfaces';
import { EditDeletePopoverComponent } from '../../components/editdelete.popover';
import { CampaignAPIService } from '../../services/campaign.api.service';

@Component({
  selector: 'app-dashboard-campaigns',
  templateUrl: './dashboard-campaigns.page.html',
  styleUrls: ['./dashboard-campaigns.page.scss'],
})
export class DashboardCampaignsPage implements OnInit {

  public campaigns: ICampaign[];

  private page = 0;

  constructor(
    private alert: AlertController,
    private popover: PopoverController,
    private actionSheet: ActionSheetController,
    private campaignAPI: CampaignAPIService
  ) { }

  ngOnInit() {
    this.loadCampaigns(0);
  }

  loadCampaigns(page = 0, $event = null): void {
    this.campaignAPI.getCampaigns(page)
      .subscribe(campaigns => {
        if ($event) {
          this.campaigns.push(...campaigns.data);

          if (this.campaigns.length >= campaigns.total) {
            $event.target.disabled = true;
          }

          $event.target.complete();
          return;
        }

        this.campaigns = campaigns.data || [];
      });
  }

  loadMoreCampaigns($event) {
    this.page += 1;
    this.loadCampaigns(this.page, $event);
  }

  async showDeleteActionSheet(camp: ICampaign) {
    const actionSheet = await this.actionSheet.create({
      header: 'Actions',
      buttons: [
        {
          text: 'Delete',
          role: 'destructive',
          icon: 'trash',
          handler: () => {
            this.attemptDeleteCharacter(camp);
          }
        }
      ]
    });

    actionSheet.present();
  }

  async showDeletePopover(event, camp: ICampaign) {
    event.stopPropagation();
    event.preventDefault();

    const popover = await this.popover.create({
      component: EditDeletePopoverComponent,
      componentProps: { showEdit: false },
      event
    });

    popover.onDidDismiss().then((res) => {
      const resAct = res.data;
      if (!resAct) { return; }

      if (resAct === 'delete') {
        this.attemptDeleteCharacter(camp);
      }
    });

    popover.present();
  }

  async attemptDeleteCharacter(camp: ICampaign) {
    const alert = await this.alert.create({
      header: 'Delete Character',
      message: `Are you sure you want to delete the campaign ${camp.name}? This is permanent and not reversible!`,
      buttons: [
        'Cancel',
        {
          text: 'Yes, delete',
          handler: () => {
            this.campaignAPI.deleteCampaign(camp._id).subscribe(() => {
              this.campaigns = this.campaigns.filter(c => c._id !== camp._id);
            });
          }
        }
      ]
    });

    alert.present();
  }

}
