import { v4 } from 'uuid';
import { PREFIX, SUCCESS, ERROR } from './consts';
const PENDINGS = {}; // pending promises

// dispatch to worker and wait for a particular response to resolve
export const middleware = () => (next) => (action) => {
  // if action is a worker one with a wait data
  if (action.type && action.type.startsWith(PREFIX)
    && action.resolvers) {
    let p = workerAsPromise(next, action);
    // save with infos
    // what if 2 with same datas? should had an uuid?
    PENDINGS[p.id] = p;
    // return promise
    return p.promise;
  }
  else {
    // check if type must resolve or reject a pending promise
    if (PENDINGS[action.workerID]) {
      // end dispatching action first.
      next(action);
      PENDINGS[action.workerID].doResolve(action);
      delete PENDINGS[action.workerID];
      return;
    }
  }
  return next(action);
};

let resolver = (resolve, reject, resolvers) => (action) => {
  let { type } = action;
  let { resolveOn, rejectOn } = resolvers;
  /* istanbul ignore else always set */
  if (resolveOn) {
    if (typeof resolveOn === 'string' && resolveOn === type) return resolve(action);
    else if (Array.isArray(resolveOn) && resolveOn.find((r) => r === type)) return resolve(action);
  }
  /* istanbul ignore else always set */
  if (rejectOn) {
    if (typeof rejectOn === 'string' && rejectOn === type) return reject(action);
    else if (Array.isArray(rejectOn) && rejectOn.find((r) => r === type)) return reject(action);
  }
}

function workerAsPromise(next, action) {
  let _resolve, _reject;
  let id = action.resolvers.workerID || v4();
  let resolveOn = action.resolvers.resolveOn || [action.type.replace(PREFIX, '') + SUCCESS,];
  let rejectOn = action.resolvers.rejectOn || [action.type.replace(PREFIX, '') + ERROR];

  let pr = new Promise((resolve, reject) => {
    _resolve = resolve;
    _reject = reject;

    // next action + payload
    // resolveOn && rejectOn, if not set, add default one
    next({
      ...action,
      workerID: id,
      resolvers: { resolveOn, rejectOn }
    });

  });

  return { doResolve: resolver(_resolve, _reject, { resolveOn, rejectOn }), promise: pr, id }
}