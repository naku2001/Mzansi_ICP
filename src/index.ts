import { Canister, query, text, update, None, Opt, ic, nat64, Vec, StableBTreeMap, Record } from 'azle';
import { v4 as uuidv4 } from 'uuid';

const Message = Record({
    id:text,
    email: text,
    language1: text,
    language2: text,
    comment: text,
    attachmentURL: text,
    createdAt: nat64,
    updatedAt: Opt(nat64),
  });

  type Message = typeof Message;

  const MessagePayload = Record({
    email: text,
    language1: text,
    language2: text,
    comment: text,
    attachmentURL: text,
  });

  type MessagePayload = typeof MessagePayload;
  let messageStorage = StableBTreeMap<text, Message>(text, Message, 0);
  
//   let messageStorage = new StableBTreeMap<string, Message>(0, 44, 1024);
// let message = '';

export default Canister({
    // Query calls complete quickly because they do not go through consensus
    getMessages: query([], Vec(Message), () => {
        return messageStorage.values();
      }),
    getMessage: query([text], Opt(Message), (id) => {
        return messageStorage.get(id);
      }),
    // Update calls take a few seconds to complete
    // This is because they persist state changes and go through consensus
    addMessage: update([MessagePayload], Message, (payload) => {
        const message: Message = {
          id: uuidv4(),
          createdAt: ic.time(),
          updatedAt: None,
          ...payload,
        };
        messageStorage.insert(message.id, message);
        return message;
      }),

      deleteMessage: update([text], Opt(Message), (id) => {
        return messageStorage.remove(id);
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