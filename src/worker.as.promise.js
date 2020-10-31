import { v4 } from 'uuid';
const PENDINGS = {}; // pending promises

// dispatch to worker and wait for a particular response to resolve
export default ({ dispatch, getState }) => (next) => (action) => {
  // if action is a worker one with a wait data
  if (action && action.type && action.type.startsWith('WORKER_')
    && action.resolvers) {
    let p = workerAsPromise(dispatch, action);
    // save with infos
    // what if 2 with same datas? should had an uuid?
    PENDINGS[p.id] = p;
    // return promise
    return p.promise;
  }
  else {
    // check if type must resolve or reject a pending promise
    if (PENDINGS[action.workerID]) {
      PENDINGS[action.workerID].doResolve(action);
      delete PENDINGS[action.workerID];
    }
  }
  return next(action);
};

let resolver = (resolve, reject, resolvers) => (action) => {
  let { type } = action;
  let { resolveOn, rejectOn } = resolvers;
  if (resolveOn) {
    if (typeof resolveOn === 'string' && resolveOn === type) return resolve(action);
    else if (Array.isArray(resolveOn) && resolveOn.find((r) => r === type)) return resolve(action);
  }
  if (rejectOn) {
    if (typeof rejectOn === 'string' && rejectOn === type) return reject(action);
    else if (Array.isArray(rejectOn) && rejectOn.find((r) => r === type)) return reject(action);
  }
}

function workerAsPromise(dispatch, action) {
  let _resolve, _reject;
  let id = action.resolvers.workerID || v4();
  let pr = new Promise((resolve, reject) => {
    let { type, payload, resolvers } = action;
    _resolve = resolve;
    _reject = reject;

    // dispatch action + payload
    dispatch({
      ...action,
      resolvers: undefined,
      workerID: id
    });

  });
  return { doResolve: resolver(_resolve, _reject, action.resolvers), promise: pr, id }
}