export class SuccessPromise<T> {
  public status = SuccessPromise.STATUS;
  public value: T;

  static create<T>(value: T) {
    return new SuccessPromise<T>(value);
  }

  static STATUS = "fulfilled" as const;

  constructor(value: T) {
    this.value = value;
  }
}
