import { Injectable } from '@angular/core';
import { initializeApp } from 'firebase/app';
import {
  deleteDoc,
  deleteField,
  doc,
  getDocs,
  getFirestore,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class DatabaseService {
  constructor() {}

  firebaseConfig = {
    apiKey: 'AIzaSyClWmJ6gjVEDavgSsIULefPIwMtRmTZvtM',
    authDomain: 'train-ticket-booking-2d87b.firebaseapp.com',
    projectId: 'train-ticket-booking-2d87b',
    storageBucket: 'train-ticket-booking-2d87b.appspot.com',
    messagingSenderId: '203246153195',
    appId: '1:203246153195:web:ca25ce3d66526ca93e7dae',
    measurementId: 'G-4MZEZCX17B',
  };
  app = initializeApp(this.firebaseConfig);
  db = getFirestore(this.app);
  currStaus: any;
  coach!: number[];

  async updateTicketAvailibility(
    ticket: string[],
    seatAvailablity: number[],
    pnr: number,
    name: string
  ) {
    this.currStaus = await this.getCurrStatus();
    this.currStaus = JSON.parse(this.currStaus);
    for (let i = 0; i < ticket.length; i++) {
      let code = ticket[i].charCodeAt(0) - 65;
      this.currStaus[code][ticket[i] as keyof any] = 'occupied';
    }
    try {
      let docRef = await setDoc(
        doc(this.db, 'pnrStatus', JSON.stringify(pnr)),
        {
          pnr: pnr,
          name: name,
          ticket: ticket,
        }
      );
      let docRef1 = await setDoc(doc(this.db, 'currentStatus', 'data'), {
        currStatus: this.currStaus,
      });
      await setDoc(doc(this.db, 'seatAvalibility', 'data'), {
        seatAvailibility: seatAvailablity,
        pnr: ++pnr,
      });
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  async getCurrStatus() {
    let data;
    const querySnapshot = await getDocs(collection(this.db, 'currentStatus'));
    querySnapshot.forEach((doc) => {
      data = JSON.stringify(doc.data().currStatus);
    });
    return data;
  }

  async getSeatAvailibility() {
    let data;
    const querySnapshot = await getDocs(collection(this.db, 'seatAvalibility'));
    querySnapshot.forEach((doc) => {
      data = doc.data();
    });
    return data;
  }

  async searchByPNR(pnr: number) {
    let pnrData;
    const querySnapshot = await getDocs(collection(this.db, 'pnrStatus'));
    querySnapshot.forEach((doc) => {
      if (doc.data().pnr == pnr) {
        pnrData = doc.data();
      }
    });
    return pnrData;
  }

  async reset() {
    this.resetData();
    try {
      let docRef = await setDoc(doc(this.db, 'currentStatus', 'data'), {
        currStatus: this.currStaus,
      });
      docRef = await setDoc(doc(this.db, 'seatAvalibility', 'data'), {
        seatAvailibility: this.coach,
        pnr: 100000,
      });
      const querySnapshot = await getDocs(collection(this.db, 'pnrStatus'));
      querySnapshot.forEach(async (document) => {
        const ref = doc(this.db, 'pnrStatus', document.id)
        // await updateDoc(ref, {
        //   pnr: deleteField(),
        //   name: deleteField(),
        //   ticket: deleteField(),
        // });
        await deleteDoc(ref);
      });
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  }

  resetData() {
    this.currStaus = [
      {
        A1: 'available',
        A2: 'available',
        A3: 'available',
      },
      {
        B1: 'available',
        B2: 'available',
        B3: 'available',
        B4: 'available',
        B5: 'available',
        B6: 'available',
        B7: 'available',
      },
      {
        C1: 'available',
        C2: 'available',
        C3: 'available',
        C4: 'available',
        C5: 'available',
        C6: 'available',
        C7: 'available',
      },
      {
        D1: 'available',
        D2: 'available',
        D3: 'available',
        D4: 'available',
        D5: 'available',
        D6: 'available',
        D7: 'available',
      },
      {
        E1: 'available',
        E2: 'available',
        E3: 'available',
        E4: 'available',
        E5: 'available',
        E6: 'available',
        E7: 'available',
      },
      {
        F1: 'available',
        F2: 'available',
        F3: 'available',
        F4: 'available',
        F5: 'available',
        F6: 'available',
        F7: 'available',
      },
      {
        G1: 'available',
        G2: 'available',
        G3: 'available',
        G4: 'available',
        G5: 'available',
        G6: 'available',
        G7: 'available',
      },
      {
        H1: 'available',
        H2: 'available',
        H3: 'available',
        H4: 'available',
        H5: 'available',
        H6: 'available',
        H7: 'available',
      },
      {
        I1: 'available',
        I2: 'available',
        I3: 'available',
        I4: 'available',
        I5: 'available',
        I6: 'available',
        I7: 'available',
      },
      {
        J1: 'available',
        J2: 'available',
        J3: 'available',
        J4: 'available',
        J5: 'available',
        J6: 'available',
        J7: 'available',
      },
      {
        K1: 'available',
        K2: 'available',
        K3: 'available',
        K4: 'available',
        K5: 'available',
        K6: 'available',
        K7: 'available',
      },
      {
        L1: 'available',
        L2: 'available',
        L3: 'available',
        L4: 'available',
        L5: 'available',
        L6: 'available',
        L7: 'available',
      },
    ];
    this.coach = [3, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7];
  }
}
