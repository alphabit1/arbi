import { expose } from 'threads/worker';

const caller = {
  go(listeners: any[], str: string) {
    console.log(str + ' ' + listeners.length);
    listeners.forEach((listener: any) => {
      console.log('hkfkjhgb');

      listener();
    });
  }
};

export type Caller = typeof caller;

expose(caller);
