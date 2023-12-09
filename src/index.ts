import { Canister, query, text, update, None, Opt, ic, nat64, Vec, StableBTreeMap, Record } from 'azle';
import { v4 as uuidv4 } from 'uuid';

const AnimalStockKeeper = Record({
    id:text,
    animalName: text,
    animalDescription: text,
    createdBy: text,
    
    createdAt: nat64,
    updatedAt: Opt(nat64),
  });

  type AnimalStockKeeper = typeof ;AnimalStockKeeper

  const AnimalStockKeeperPayload = Record({
      
     animalName: text,
    animalDescription: text,
    createdBy: text,
    
  });

  type AnimalStockKeeperPayload  = typeof AnimalStockKeeperPayload;
  let AnimalStockKeeperStorage = StableBTreeMap(text,AnimalStockKeeper, 0);
  


export default Canister({
    // Query calls complete quickly because they do not go through consensus
    getTickets: query([], Vec(Ticket), () => {
        return TicketStorage.values();
      }),
    getAnimalStockKeeper: query([text], Opt(AnimalStockKeeper), (id) => {
        return AnimalStockKeeperStorage.get(id);
      }),
    // Update calls take a few seconds to complete
    // This is because they persist state changes and go through consensus
    addAnimalStockKeeper: update([AnimalStockKeeperPayload], AnimalStockKeeper, (payload) => {
        const AnimalStockKeeper: AnimalStockKeeper = {
          id: uuidv4(),
          createdAt: ic.time(),
          updatedAt: None,
          ...payload,
        };
        AnimalStockKeeperStorage.insert(AnimalStockKeeper.id, AnimalStockKeeper);
        return AnimalStockKeeper;
      }),

      deleteAnimalStockKeeper: update([text], Opt(AnimalStockKeeper), (id) => {
        return AnimalStockKeeperStorage.remove(id);
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
