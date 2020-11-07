import { PREFIX } from './consts';
/**
 * Background process middleware for application/redux
 */
export const middleware = (_worker) => (store) => {
  // init worker with store dispatch
  const worker = initWorker(_worker, store.dispatch);

  return next => action => {
    let { type } = action;
    if (type.startsWith(PREFIX)) {
      // send to process
      return worker.process(action)
        .then((result) => {
          if (result && result.type) next(result);// if something, pass the new action *not implemented yet
          else next(action);// if no response from worker, pass action to others
        })
        .catch((err) => {
          // what to do next?
          next(action); // go for next
        });
    } else {
      // not for worker, pass
      return next(action); // go for next
    }

  }
}

export function initWorker(worker, dispatch) {
  // listen to worker message, dispatch result
  // exemple with counter
  worker.addEventListener('message', (result) => dispatch(result.data));
  return {
    process: function (action) {
      return new Promise((resolve, reject) => {
        worker.postMessage(action);
        resolve();
      });
    }
  }
}