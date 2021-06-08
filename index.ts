import { ParallelExecutor } from "./promiseall/ParallelExecutor";

const timeout = (time: number) => {
  if (time === 3901) return Promise.reject("asd");

  return new Promise((resolve) => setTimeout(resolve, time));
};
const log = (mes: any) => () => {
  // console.log(mes)
  return mes;
};

const parallelExecutor = ParallelExecutor.create<number>(2);

parallelExecutor.load([() => timeout(4000).then(log(1)), () => timeout(3901).then(log(2))]);

setTimeout(() => {
  if (parallelExecutor.isInWork()) {
    parallelExecutor.push(() => timeout(2000).then(log(6)));
  }
}, 500);

parallelExecutor.handleEach((success, error) => {
  console.log("success - ", success);
  console.log("error - ", error);
});
parallelExecutor.handleAll((success, error) => {
  console.log("success - ", success);
  console.log("error - ", error);
});

parallelExecutor.run();
parallelExecutor.run();
