import { RejectedPromise } from "./Promises/RejectedPromise";
import { SuccessPromise } from "./Promises/SuccessPromise";
import { EachPromiseExecutor } from "./Executors/EachPromiseExecutor";
import { AllPromiseExecutor } from "./Executors/AllPromiseExecutor";
import { PromiseHandler } from "./PromiseHandler";
import { BasePromiseExecutor } from "./Executors/BasePromiseExecutor";

type PromiseResult<T> = SuccessPromise<T> | RejectedPromise;

export class ParallelExecutor<T> {
  private promiseHandlers: Array<PromiseHandler<T>> = [];
  private executors: Array<() => BasePromiseExecutor<T>> = [];
  private promises: any;

  constructor(private maxParallelCount: number) {}

  static create<T>(maxParallelCount: number) {
    return new ParallelExecutor<T>(maxParallelCount);
  }

  load(promises: Array<() => Promise<T>>) {
    this.promises = [...promises];
  }

  run() {
    const promiseHandler = new PromiseHandler<T>(this.maxParallelCount, this.promises, this.executors);
    promiseHandler.run();
    this.promiseHandlers.push(promiseHandler);
  }

  handleEach(callback: (success: PromiseResult<T>, error: RejectedPromise) => any) {
    this.executors.push(() => EachPromiseExecutor.create(this.maxParallelCount, callback));
  }

  handleAll(callback: (successes: Array<SuccessPromise<T>>, errors: RejectedPromise[]) => any) {
    this.executors.push(() => AllPromiseExecutor.create<T>(this.maxParallelCount, callback));
  }

  push(promise: () => Promise<T>) {
    this.promiseHandlers.forEach((promiseHandler) => promiseHandler.push(promise));
  }

  isInWork() {
    return this.promiseHandlers.some((promiseHandler) => promiseHandler.isInWork());
  }

  clear() {
    this.promises = [];
    this.executors = [];
    this.promiseHandlers = [];
  }
}
