/* eslint-disable no-restricted-globals */
import { SUCCESS, ERROR, PREFIX } from '../middlewares/consts';
/**
 * @fileOverview Redux-like action processor
 * @module worker
 */

/**
 * @method
 * Process redux-like actions on worker thread
 * @param {Any} event redux-like action
 * @param {function} cllbck callback to send result to main thread
 */
function handleActions(event, cllbck, handlers) {
  if (!event || !event.type) return; // do nothing action
  // should replay handler?
  const callback = (evt) => handleActions(evt, cllbck, handlers);

  let { type, workerID } = event || {};
  let resolvers = event.resolvers || {
    resolveOn: (type || '').replace(PREFIX, '') + SUCCESS,
    rejectOn: (type || '').replace(PREFIX, '') + ERROR,
  }
  if (handlers[type]) {

    handlers[type](event, callback)
      .then((data) => {
        let tmp = __createEventFromHandlerResponse(data, resolvers.resolveOn);
        tmp.workerID = workerID;
        callback(tmp)
      }).catch((err) => {
        let tmp = __createEventFromHandlerResponse(err, resolvers.rejectOn);
        tmp.workerID = workerID;
        callback(tmp);
      });

  }
  // else send to main? or do nothing?
  if (!event.type.startsWith(PREFIX)) return cllbck(event);
  else console.warn(`Worker call action with ${PREFIX} (${event.type}), to prevent infinite loop, action is discarded`)
}

function __createEventFromHandlerResponse(data, resolver) {
  // user can have return a full response (ie type AND payload)
  // in that case, just had workerID
  let tmp = {};
  if (data.type && data.payload) tmp = { ...data };
  else {
    // consider this is a payload only
    let resolve = resolver;
    if (Array.isArray(resolver)) resolve = resolve[0]; // How to set a default?
    tmp = { type: resolve, payload: data };
  }
  return tmp;
}

export default function initWorker(handlers) {
  self.addEventListener("message", (event) => handleActions(event.data, self.postMessage, handlers));
}
