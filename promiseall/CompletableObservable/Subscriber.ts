export class Subscriber {
  constructor(private nextFunction: any) {}

  static create(nextFunction: any) {
    return new Subscriber(nextFunction);
  }

  next(value: boolean) {
    this.nextFunction(value);
  }
}
