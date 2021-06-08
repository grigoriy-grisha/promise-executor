import { BasePromiseExecutor } from "./Executors/BasePromiseExecutor";

export class PromiseHandler<T> {
  private inWork = false;
  private promiseExecutors: Array<BasePromiseExecutor<T>> = [];

  constructor(
    private maxParallelCount: number,
    private promises: Array<() => Promise<T>>,
    private executors: Array<() => BasePromiseExecutor<T>> = [],
  ) {}

  isInWork() {
    return this.inWork;
  }

  run() {
    this.inWork = true;
    this.executors.forEach((executor) => {
      const promiseExecutor = executor();
      promiseExecutor.execute(this.promises);
      this.promiseExecutors.push(promiseExecutor);
    });
    this.subscribeToExecutors();
  }

  private subscribeToExecutors() {
    this.promiseExecutors.forEach((performingExecutor) => performingExecutor.subscribeToComplete(this.clear));
  }

  push(promise: () => Promise<T>) {
    this.promiseExecutors.forEach((executor) => executor.push(promise));
  }

  private clear = () => {
    this.inWork = false;
    this.promises = [];
  };
}
