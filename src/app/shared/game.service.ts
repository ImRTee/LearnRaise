import {Injectable} from "@angular/core";
import {PetService} from "./pet.service";
import {OwnerService} from "./owner.service";
import { AlertifyService } from "./alertify.service";
/**
 * Created by imrtee on 14/11/2017.
 */
@Injectable()
export class GameService {
  constructor(private petServ: PetService,
              private ownerServ: OwnerService,
              private alertify: AlertifyService) {
  }

  onFoodAdded() {
    // Experience
    const experienceArr = this.petServ.getExpArray();
    const currentExp = experienceArr[0];
    const totalExp = experienceArr[1];
    if (currentExp < totalExp) { // if still not enough food to level up
      this.petServ.gainExpAndPower();
      this.ownerServ.gainScoreWhenFeeding();
      this.alertify.success("+1 hour");
    } else { // Level Up mechanism
      const currentLevel = this.petServ.getCurrentLevel();
      switch (currentLevel) {
        case 1:
          this.petServ.levelUp(2, 8, 36000000); // 3 parameters are newLevel, newExp and newHungerTime
          break;
        case 2:
          this.petServ.levelUp(3, 16, 54000000);
          break;
        case 3:
          this.petServ.levelUp(4, 28, 86400000);
          break;
        case 4:
          this.petServ.levelUp(5, 40, 162000000);
          break;
        case 5:
          this.petServ.evolve('teenager');
          this.ownerServ.gainScoreWhenEvolving();
          alert('wow wow wow evolution!');
          break;
        case 6:
          this.petServ.levelUp(6, 50, 331200000);
          break;
        case 7:
          this.petServ.levelUp(7, 35, 259200000);
          this.petServ.evolve('mature');
          alert('wow wow wow evolution!');
          this.ownerServ.gainScoreWhenEvolving();
          this.petServ.levelUp(8, 70, 136800000);
          break;
        case 8:
          this.petServ.levelUp(9, 100, 432000000);
          break;
        case 9:
          this.petServ.levelUp(10, 200, 604800000);
          this.petServ.evolve('legendary');
          this.ownerServ.gainScoreWhenEvolving();
          alert('wow wow wow evolution!');
          break;
      }
    }
    // Hunger
    const  hungerTimeArray = this.petServ.getHungerTimeArray();
    const currentTime = hungerTimeArray[0];
    const totalTime = hungerTimeArray[1];
    if (currentTime < totalTime) {
      this.petServ.moreHungerTime();
    }
    this.petServ.startGettingHungry();
    this.petServ.updatePet();
    this.ownerServ.gainScoreWhenFeeding();
  }
}

