import { expose } from 'threads/worker';

const caller = {
  call(listeners: any[]) {
    listeners.forEach((listener: any) => {
      listener();
    });
  }
};

export type Caller = typeof caller;

expose(caller);
