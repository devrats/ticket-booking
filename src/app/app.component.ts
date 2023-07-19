import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupName,
  Validators,
} from '@angular/forms';
import Swal from 'sweetalert2';
import { DatabaseService } from './database.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  ticketForm!: FormGroup;
  pnrForm!: FormGroup;
  limitExceed: boolean = false;
  tickets: string[] = [];
  searchThroughPNR: boolean = false;
  coach!: number[];
  currStatus: any;
  pnr: number = 100000;

  ngOnInit(): void {
    this.initForm();
  }
  title = 'ticket-booking';

  constructor(private formBuilder: FormBuilder, private databaseService: DatabaseService) { }

  initForm() {
    this.ticketForm = this.formBuilder.group({
      numberOfTicket: ['', [Validators.required]],
      name: ['', [Validators.required]],
    });

    this.pnrForm = this.formBuilder.group({
      pnrNumber: [
        '',
        [Validators.required, Validators.maxLength(6), Validators.minLength(6)],
      ],
    });
  }
  
  // function to allow numeric values only
  numericOnly(event: any, formControl: any) {
    let val = event.target?.value.replace(/\D/g, '');
    formControl?.setValue(val);
    if (formControl == this.ticketForm.get('numberOfTicket')) {
      this.limiter();
    }
  }

  // function to allow only to a limit to ticket
  limiter() {
    let val = this.ticketForm.get('numberOfTicket')?.value;
    if (val > 7) {
      this.ticketForm
        .get('numberOfTicket')
        ?.setErrors({ limit: 'limit exceed' });
      this.limitExceed = true;
    } else {
      this.limitExceed = false;
    }
  }

  // function to book ticket (rider function)
  async bookTicket() {
    if (this.ticketForm.invalid) {
      return;
    }
    this.tickets = [];
    let seats: any = await this.databaseService.getSeatAvailibility()
    this.coach = seats.seatAvailibility;
    this.pnr = seats.pnr
    let numberOfTickets = JSON.parse(
      this.ticketForm.get('numberOfTicket')?.value
    );
    let tickets = this.findSeats(numberOfTickets);
    if (tickets) {
      this.ticketMaker(tickets, numberOfTickets);
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Required Number of Tickets are Not Available',
        text: 'Apology For The Inconvenience',
      });
      return;
    }
    Swal.fire({
      icon: 'success',
      title: 'Tickets Booked Successfully',
      html: `<div> PNR : ${this.pnr}<br> Seat Numbers : ${this.tickets
        } </div>`,
    });
    this.databaseService.updateTicketAvailibility(this.tickets, this.coach, this.pnr, this.ticketForm.get('name')?.value);
    // console.log(this.tickets);
  }

  // function to find closest seats by checking in blocks from 1 to 12
  findSeats(noOfTicket: number) {
    let blockSize = 1;
    let seatAvailable = 0;
    for (blockSize; blockSize <= this.coach.length; blockSize++) {
      for (let i = 0; i < this.coach.length - blockSize + 1; i++) {
        seatAvailable = 0;
        for (let j = i; j < blockSize + i; j++) {
          seatAvailable += this.coach[j];
        }
        if (seatAvailable >= noOfTicket) {
          return { blockSize, i };
        }
      }
    }
    return null;
  }

  // function to allocate ticket
  ticketMaker(ticketsDetails: any, numberOfTicket: number) {
    const { blockSize, i } = ticketsDetails;
    for (let j = i; j < blockSize + i; j++) {
      if (numberOfTicket >= this.coach[j]) {
        let ticketInRow = this.coach[j];
        this.createTicket(j, ticketInRow);
        numberOfTicket -= ticketInRow;
        this.coach[j] -= ticketInRow;
      } else {
        this.createTicket(j, numberOfTicket);
        this.coach[j] -= numberOfTicket;
      }
    }
  }

    // function to create ticket numbers
  createTicket(row: number, seats: number) {
    let startingPoint;
    if (row == 0) {
      startingPoint = 3 - this.coach[row];
    } else {
      startingPoint = 7 - this.coach[row];
    }
    var code = row + 65;
    var letter = String.fromCharCode(code);
    for (let j = startingPoint; j < seats + startingPoint; j++) {
      this.tickets.push(letter + (j + 1));
    }
  }

  // function to search ticket by PNR

  async search() {
    if (this.pnrForm.invalid) {
      return;
    }
    let data:any = await this.databaseService.searchByPNR(this.pnrForm.get('pnrNumber')?.value);
    if(data){

      Swal.fire({
        icon: 'success',
        title: 'Tickets Details are',
        html: `<div> Name : ${data?.name}<br> Seat Numbers : ${data.ticket
          } </div>`,
      });
    } else{
      Swal.fire({
        icon: 'error',
        title: 'No data Found',
      });
    }
  }

  // function to find current status
  async checkCurrStatus() {
    this.currStatus = await this.databaseService.getCurrStatus();
    this.currStatus = JSON.parse(this.currStatus)
  }

  //function to reset the database
  async reset(){
    await this.databaseService.reset();
    Swal.fire({
      icon: 'success',
      title: 'Reset Successfull'
    });
  }
}
