import { Injectable } from '@angular/core';

import { random, sample } from 'lodash';

import { INPC } from '../../interfaces';
import { ContentService } from './content.service';
import { ItemCreatorService } from './item-creator.service';

interface IRandomNPCOpts {
  validFactions: string[];

  pickWeapon: boolean;
  pickArmor: boolean;
  pickBow: boolean;
  pickShield: boolean;

  injuryRange: number[];
  exhaustionRange: number[];
  depletionRange: number[];
  moraleRange: number[];
}

@Injectable({
  providedIn: 'root'
})
export class NPCCreatorService {

  constructor(
    private content: ContentService,
    private itemCreator: ItemCreatorService
  ) { }

  createRandomNPC(opts: IRandomNPCOpts): INPC {

    const nums = {
      0: 25,
      1: 50,
      2: 30,
      3: 15,
      4: 5
    };

    const pickRandomFromRange = (([lower, upper]: number[]) => {
      const choices = [];

      for (let i = lower; i <= upper; i++) {
        for (let n = 0; n < nums[i]; n++) {
          choices.push(i);
        }
      }

      return sample(choices);
    });

    const npc: INPC = {
      name: sample(this.content.getNames()),
      faction: sample(opts.validFactions),
      look: 'like a goat',
      job: sample(this.content.getJobs()),
      drive: sample(this.content.getNPCDrives()),
      attack: this.content.getRandomAttack(),
      equipment: [],
      notes: '',
      harm: {
        depletion: 0,
        exhaustion: 0,
        injury: 0,
        morale: 0
      },
      harmMax: {
        depletion: pickRandomFromRange(opts.depletionRange),
        exhaustion: pickRandomFromRange(opts.exhaustionRange),
        injury: pickRandomFromRange(opts.injuryRange),
        morale: pickRandomFromRange(opts.moraleRange)
      }
    };

    if (opts.pickArmor && sample([true, false])) {
      npc.equipment.push(this.itemCreator.createRandomArmor({ validFactions: opts.validFactions }));
    }

    if (opts.pickBow && sample([true, false])) {
      npc.equipment.push(this.itemCreator.createRandomBow({ validFactions: opts.validFactions }));
    }

    if (opts.pickWeapon && sample([true, true, false])) {
      npc.equipment.push(this.itemCreator.createRandomWeapon({ validFactions: opts.validFactions }));
    }

    if (opts.pickShield && sample([true, false, false])) {
      npc.equipment.push(this.itemCreator.createRandomShield({ validFactions: opts.validFactions }));
    }

    return npc;
  }
}
