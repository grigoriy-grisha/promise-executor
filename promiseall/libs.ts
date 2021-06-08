export function parallel(maxParallelPromises: number) {
  let countActivePromises = 0;
  const waitingPromises: Array<() => Promise<any>> = [];
  const incrementCountActivePromises = () => countActivePromises++;
  const decrementCountActivePromises = () => countActivePromises--;

  return function taskRunner(promise: () => Promise<any>) {
    return new Promise((resolve, reject) => {
      const preparedPromise = () => promise().then(resolve, reject);
      if (countActivePromises < maxParallelPromises) {
        incrementCountActivePromises();
        preparedPromise().then(() => {
          decrementCountActivePromises();
          runWaitingPromise();
        });
        return;
      }
      waitingPromises.push(preparedPromise);
    });

    function runWaitingPromise() {
      if (waitingPromises.length === 0) return;
      taskRunner(waitingPromises.shift());
    }
  };
}
