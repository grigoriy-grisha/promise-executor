export interface BasePromiseExecutor<T> {
  execute(promise: Array<() => Promise<T>>): void;
  push(promise: () => Promise<T>): void;
  subscribeToComplete(nextFunction: (value: boolean) => any): void;
}
