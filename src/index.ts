import { Canister, query, text, update, None, Opt, ic, nat64, Vec, StableBTreeMap, Record } from 'azle';
import { v4 as uuidv4 } from 'uuid';

const Ticket = Record({
    id:text,
    assignee: text,
    description: text,
    createdBy: text,
    
    createdAt: nat64,
    updatedAt: Opt(nat64),
  });

  type Ticket = typeof Ticket;

  const TicketPayload = Record({
    email: text,
    assignee: text,
    description: text,
    createdBy: text,
    
  });

  type TicketPayload = typeof TicketPayload;
  let TicketStorage = StableBTreeMap(text, Ticket, 0);
  
//   let TicketStorage = new StableBTreeMap<string, Ticket>(0, 44, 1024);
// let Ticket = '';

export default Canister({
    // Query calls complete quickly because they do not go through consensus
    getTickets: query([], Vec(Ticket), () => {
        return TicketStorage.values();
      }),
    getTicket: query([text], Opt(Ticket), (id) => {
        return TicketStorage.get(id);
      }),
    // Update calls take a few seconds to complete
    // This is because they persist state changes and go through consensus
    addTicket: update([TicketPayload], Ticket, (payload) => {
        const Ticket: Ticket = {
          id: uuidv4(),
          createdAt: ic.time(),
          updatedAt: None,
          ...payload,
        };
        TicketStorage.insert(Ticket.id, Ticket);
        return Ticket;
      }),

      deleteTicket: update([text], Opt(Ticket), (id) => {
        return TicketStorage.remove(id);
      }),
});

  // a workaround to make uuid package work with Azle
  globalThis.crypto = {
    // @ts-ignore
   getRandomValues: () => {
       let array = new Uint8Array(32)
  
       for (let i = 0; i < array.length; i++) {
           array[i] = Math.floor(Math.random() * 256)
       }
  
       return array
   }
  }