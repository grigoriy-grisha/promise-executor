import { parallel } from "../libs";
import { RejectedPromise } from "../Promises/RejectedPromise";
import { SuccessPromise } from "../Promises/SuccessPromise";
import { CompletableObservable } from "../CompletableObservable/CompletableObservable";
import { BasePromiseExecutor } from "./BasePromiseExecutor";

export class EachPromiseExecutor<T> implements BasePromiseExecutor<T> {
  private addTask = parallel(this.maxParallelCount);
  private promises: Array<() => Promise<T>> = [];
  private completedPromises: Array<SuccessPromise<T>> = [];
  private errorQueue: Array<RejectedPromise> = [];
  private completableObservable = new CompletableObservable();

  constructor(private maxParallelCount: number, private readonly callback: any) {}

  static create<T>(maxParallelCount: number, callback: any) {
    return new EachPromiseExecutor<T>(maxParallelCount, callback);
  }

  private runTask = (promise: () => Promise<T>) => {
    this.addTask(promise).then(this.successProcessPromise).catch(this.rejectProcessPromise);
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

  private rejectProcessPromise = (error: any) => {
    const reject = RejectedPromise.create(error);
    this.errorQueue.push(reject);
    this.callback(null, reject);
  };

  private successProcessPromise = (resultPromise: T) => {
    const result = SuccessPromise.create<T>(resultPromise);
    this.completedPromises.push(result);

    this.notifyEach(result);

    if (this.isCompleted()) this.completableObservable.complete();
  };

  private notifyEach(result: SuccessPromise<T>) {
    this.callback(result, null);
  }

  private isCompleted() {
    return this.completedPromises.length + this.errorQueue.length === this.promises.length;
  }
}
