import { Injectable } from '@angular/core';
import 'rxjs/Rx';
import {Food} from "./food.model";
import {Pet} from "./pet.model";
import {Owner} from "./owner.model";
import {firebaseConfig} from "../../environments/firebase.config"
import {AngularFireDatabase} from "angularfire2/database";
import {LocalStorageManager} from "./localStorageManager.service";
import {Subject} from "rxjs/Subject";
import {AngularFireAuth} from "angularfire2/auth";
import {HttpClient} from "@angular/common/http";


/**
 * This class contains codes to deal with the firebase such as:
 * <ul>
 *  Retrieve token to used to make request to the database
 *  Delete token
 *  Manipulating Pet, Owner and Stomach Table
 * </ul>
 */
@Injectable()
export class ServerService {
  private token: string;
  private userId: string;
  onOwnerIdAndTokenReady = new Subject();
  constructor(private httpClient: HttpClient,
              private lsManager: LocalStorageManager,
              private db: AngularFireDatabase,
              private afAuth: AngularFireAuth
              ) {
  }
  /**
   * Retrieve Token from local storage and store it a variable so that it can be used later to make request to the server
   */
  getTokenReady () {
    //@source https://stackoverflow.com/questions/39035594/firebase-retrieve-the-user-data-stored-in-local-storage-as-firebaseauthuser
    const currentTime = Date.now();
    const user = this.lsManager.getUserInfo();
    // check if the token has been expired
    if (currentTime > user.stsTokenManager.expirationTime) { // if expired
      window.location.href = '/authentication/login';
      return false // for canDeativative component
    } else {
      this.token = user.stsTokenManager.accessToken;
      return true // for canDeactivative component
    }

  }

  deleteToken() {
    this.token = "";
  }

  /**
   * Called to get the ownerKey and Token before manipulating the data (add, update, delete)
   * @param {string} userId
   */
  setUpOwnerIdAndToken() {
    // If there is user info in the local storage
    if (this.lsManager.getUserInfo()) {
      if (this.getTokenReady()){
        //Get user id from the Local Storage
        const user = this.lsManager.getUserInfo();
        this.userId = user.uid;
        // Wait for the other components a little bit to subscribe to the event before notify them (services are run before components)
        setTimeout(()=>{
          this.onOwnerIdAndTokenReady.next();
        }, 0.5);
      }
    } else {
      window.location.href = "./index.html";
    }
  }
  getUserId() {
    const returnId = this.userId;
    return returnId;
  }

  // OWNERS TABLE
  addOwner(userId, owner: Owner) {
    return this.httpClient.post<any>(`${firebaseConfig.databaseURL}/owners/${userId}.json?auth=${this.token}`, owner)
  }
  updateOwner(owner: Owner) {
    return this.httpClient.put(`${firebaseConfig.databaseURL}/owners/${this.userId}.json?auth=${this.token}`, owner);
  }
  getOwner() {
    return this.httpClient.get<Owner>(`${firebaseConfig.databaseURL}/owners/${this.userId}.json?auth=${this.token}`)
  }
  getAllOwners() {
    return  this.db.list("owners").valueChanges();
  }


  // PETS TABLE
  getPet() {
    return this.httpClient.get<Pet>(`${firebaseConfig.databaseURL}/pets/${this.userId}.json?auth=${this.token}`)
  }
  addPet(userId: string, pet: Pet) {
    return this.httpClient.put(`${firebaseConfig.databaseURL}/pets/${userId}.json?auth=${this.token}`, pet)
  }
  updatePet( pet: Pet) {
    return this.httpClient.put(`${firebaseConfig.databaseURL}/pets/${this.userId}.json?auth=${this.token}`, pet).subscribe();
  }
  saveLeaveTimeAndHungerTime(oId, leaveTime: number, currentHungerTime: number[]) {
    const xhr = new XMLHttpRequest();
    const leaveTimeData = JSON.stringify(leaveTime);
    xhr.open("PUT",`${firebaseConfig.databaseURL}/pets/${this.userId}/leaveTime.json?auth=${this.token}`, false);
    xhr.send(leaveTimeData);
    const currentHungerTimeData = JSON.stringify(currentHungerTime);
    xhr.open("PUT",`${firebaseConfig.databaseURL}/pets/${this.userId}/hungerTime.json?auth=${this.token}`, false);
    xhr.send(currentHungerTimeData);

    this.deleteToken();
  }



  // STOMACHS TABLE
  /**
   * Used to add food when authenticating
   * @param ownerKey
   * @param {Food} newFood
   * @return {Observable<Response>}
   */
  addFood(userId, newFood: Food){
    return this.httpClient.post(`${firebaseConfig.databaseURL}/stomachs/${userId}.json?auth=${this.token}`, newFood)
  }
  // getFoods() {
  //    return this.db.list(`stomachs/${this.ownerKey}`).valueChanges();
  // }


}
