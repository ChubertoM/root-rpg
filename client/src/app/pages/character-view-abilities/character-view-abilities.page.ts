import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';

import { ICharacter } from '../../../interfaces';
import { ChangeDrivesComponent } from '../../components/change-drives/change-drives.component';
import { MarkdownPipe } from '../../pipes/markdown.pipe';
import { ContentService } from '../../services/content.service';
import { DataService } from '../../services/data.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-character-view-abilities',
  templateUrl: './character-view-abilities.page.html',
  styleUrls: ['./character-view-abilities.page.scss'],
})
export class CharacterViewAbilitiesPage implements OnInit {

  public isSearchOpen: boolean;
  public searchQuery: string;

  constructor(
    private markdown: MarkdownPipe,
    private modal: ModalController,
    private alert: AlertController,
    private notification: NotificationService,
    public content: ContentService,
    public data: DataService
  ) { }

  ngOnInit() {
  }

  toggleSearch() {
    if (this.isSearchOpen) {
      this.closeSearch();
      return;
    }

    this.openSearch();
  }

  openSearch() {
    this.isSearchOpen = true;
    this.searchQuery = '';
  }

  closeSearch() {
    this.isSearchOpen = false;
    this.searchQuery = '';
  }

  setSearchValue(value: string) {
    this.searchQuery = value;
  }

  filterArray(arr: string[]): string[] {
    if (!this.searchQuery || !this.isSearchOpen) { return arr; }
    return arr.filter(s => s.toLowerCase().includes(this.searchQuery.toLowerCase()));
  }

  parseMarkdown(md: string): string {
    return this.markdown.transform(md);
  }

  async viewHTML(title: string, markdown: string) {
    const html = this.parseMarkdown(markdown);

    const alert = await this.alert.create({
      header: title,
      message: html,
      buttons: ['Close'],
      cssClass: 'big-alert'
    });

    alert.present();
  }

  viewNature(nature: string) {
    const md = this.content.getNature(nature)?.text;
    this.viewHTML(nature, md);
  }

  viewDrive(drive: string) {
    const md = this.content.getDrive(drive)?.text;
    this.viewHTML(drive, md);
  }

  viewMove(move: string) {
    const md = this.content.getMove(move)?.text;
    this.viewHTML(move, md);
  }

  viewSkill(skill: string) {
    const md = this.content.getSkill(skill)?.text;
    this.viewHTML(skill, md);
  }

  viewFeat(feat: string) {
    const md = this.content.getFeat(feat)?.text;
    this.viewHTML(feat, md);
  }

  getFeats(character: ICharacter): string[] {
    const addedFeats = character.moves.map(x => this.content.getMove(x)?.addFeat).flat().filter(Boolean);
    return [...new Set(character.feats.concat(addedFeats).sort())];
  }

  getSkills(character: ICharacter): string[] {
    const addedSkills = character.moves.map(x => this.content.getMove(x)?.addSkill).flat().filter(Boolean);
    return [...new Set(character.skills.concat(addedSkills).sort())];
  }

  getMoves(character: ICharacter): string[] {
    return character.moves.sort();
  }

  getDrives(character: ICharacter): string[] {
    return character.drives.sort();
  }

  async changeNature(character: ICharacter): Promise<void> {
    const natures = this.content.getVagabond(character.archetype).natures
      .map(({ name }) => ({ name, text: this.content.getNature(name)?.text }));

    const modal = await this.notification.loadForcedChoiceModal(
      `Change Nature`,
      `Choose a new nature.`,
      natures,
      1
    );

    modal.onDidDismiss().then(({ data }) => {
      if (!data) { return; }

      const { name } = data[0];
      character.nature = name;

      this.data.patchCharacter().subscribe(() => {});
    });

  }

  async changeDrives(character: ICharacter): Promise<void> {
    const modal = await this.modal.create({
      component: ChangeDrivesComponent
    });

    modal.onDidDismiss().then(({ data }) => {
      if (!data) { return; }

      const { drives, driveTargets } = data;
      character.drives = drives;
      character.driveTargets = driveTargets;

      this.data.patchCharacter().subscribe(() => {});
    });

    modal.present();
  }

}
