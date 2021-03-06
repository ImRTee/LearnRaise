import {
  AfterContentChecked, AfterContentInit, AfterViewChecked, Component, DoCheck, OnChanges, OnDestroy,
  OnInit
} from '@angular/core';
import {Food} from "../../../shared/food.model";
import {StomachService} from "./stomach.service";
import {Subscription} from "rxjs";
import {PetService} from "../../../shared/pet.service";
import {MainService} from "../../main.service";
import {ActivatedRoute, Router} from "@angular/router";
import {ServerService} from "../../../shared/server.service";
import {AuthService} from "../../../authentication/auth-service";
declare var $: any;
@Component({
  selector: 'app-stomach',
  templateUrl: './stomach.component.html',
  styleUrls: ['./stomach.component.css'],
  // providers: [StomachService]
})


export class StomachComponent implements OnInit, OnDestroy{
  ownerId: string;
  selectedFood: Food;
  editingFoodIndex: number;
  foodsInStomach: Food[];
  isEditing = false;
  isSelecting = false;
  displayDes = false;
  foodEditSub: Subscription;
  foodAddedSub: Subscription;
  closingEditModal: Subscription;
  constructor(private stomachServ: StomachService,
              private router: Router) { }
  ngOnInit() {
    window.onload =  () => {
      this.router.navigate(['/main'])
    };
    this.stomachServ.getFoodsObserver().subscribe(
      (foods: Food[]) => { this.foodsInStomach = foods.reverse()}
    );

    // When a food is selected, display its description
    this.stomachServ.foodSelectedEvent.subscribe(
      (food: Food) => {
        this.selectAndDisplayFoodDes(food);
      }
    );

    // When a food is added, select and display its description
    this.stomachServ.foodAddedEvent.subscribe(
      (food: Food) => {
        this.selectAndDisplayFoodDes(food)
      }
    );

    // When a food is being edited
    this.foodEditSub = this.stomachServ.foodEditEvent.subscribe(
      (foodIndex: number) => {
        this.isEditing = true;
        this.isSelecting = false;
        this.editingFoodIndex = foodIndex; // Used for selecting the right food to edit
      }
    );
    // if there is any change in the food array, close the description window
    this.stomachServ.foodChangedEvent.subscribe(
      (food: Food) => {
        this.selectAndDisplayFoodDes(food)
      }
    );

    this.closingEditModal = this.stomachServ.closeEditingModalBoxEvent.subscribe(
      () => {
        this.closeEditingModalBox();
      }
    );
  }

  selectAndDisplayFoodDes(selectedFood: Food){
    this.selectedFood = selectedFood;
    //If the food is not undefined select and display its description
    if(this.selectedFood != undefined){
      this.isSelecting = true;
      this.displayDes = true;
    } else {
      this.isSelecting = false;
      this.displayDes = false;
    }
  }

  ngOnDestroy() {
    // this.stomachServ.saveFoodsToDatabase();
    this.foodEditSub.unsubscribe();
    this.closingEditModal.unsubscribe();
    this.displayDes = false; // stop displaying description
  }

  closeEditingModalBox() {
    const shadowEl = document.getElementsByClassName('modal-backdrop');
    shadowEl[0].remove();
    this.isEditing = false;
    this.isSelecting = false;
  }
}
