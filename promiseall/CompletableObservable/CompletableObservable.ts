import { Subscriber } from "./Subscriber";

export class CompletableObservable {
  private subscriber: Subscriber;

  subscribe(next: (...args: any) => any) {
    this.subscriber = Subscriber.create(next);
  }

  complete() {
    this.subscriber.next(true);
  }
}
