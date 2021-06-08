import { parallel } from "../libs";
import { RejectedPromise } from "../Promises/RejectedPromise";
import { SuccessPromise } from "../Promises/SuccessPromise";
import { CompletableObservable } from "../CompletableObservable/CompletableObservable";
import { BasePromiseExecutor } from "./BasePromiseExecutor";

export class AllPromiseExecutor<T> implements BasePromiseExecutor<T> {
  private addTask = parallel(this.maxParallelCount);

  private promises: Array<() => Promise<T>> = [];
  private completedPromises: Array<SuccessPromise<T>> = [];
  private errorQueue: Array<RejectedPromise> = [];
  private completableObservable = new CompletableObservable();

  static create<T>(maxParallelCount: number, callback: any) {
    return new AllPromiseExecutor<T>(maxParallelCount, callback);
  }

  constructor(private maxParallelCount: number, private readonly callback: any) {}

  private runTask = (promise: () => Promise<T>) => {
    this.addTask(promise).then(this.allProcessPromise).catch(this.rejectProcessPromise);
  };

  push(promise: () => Promise<T>) {
    this.promises.push(promise);
    this.runTask(promise);
  }

  execute(promises: Array<() => Promise<T>>) {
    this.promises = [...promises];
    this.promises.forEach(this.runTask);
  }

  subscribeToComplete(nextFunction: (value: boolean) => any) {
    this.completableObservable.subscribe(nextFunction);
  }

  private allProcessPromise = (resultPromise: T) => {
    const result = SuccessPromise.create<T>(resultPromise);
    this.completedPromises.push(result);

    if (this.isCompleted()) {
      this.notifyAll();
      this.completableObservable.complete();
    }
  };

  private rejectProcessPromise = (error: any) => {
    const reject = RejectedPromise.create(error);
    this.errorQueue.push(reject);
  };

  private notifyAll() {
    this.callback(this.completedPromises, this.errorQueue);
  }

  private isCompleted() {
    return this.completedPromises.length + this.errorQueue.length === this.promises.length;
  }
}
