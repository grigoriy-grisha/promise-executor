export class RejectedPromise {
  public status = RejectedPromise.STATUS;
  public reason: any;

  static create(reason: any) {
    return new RejectedPromise(reason);
  }

  static STATUS = "rejected" as const;

  constructor(reason: any) {
    this.reason = reason;
  }
}
