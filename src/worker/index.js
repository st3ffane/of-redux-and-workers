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
function handleActions(event, cllbck, store, handlers) {
  if (!event || !event.type) return; // do nothing action
  console.log('Call to handle action ' + event.type);
  // should replay handler?
  const callback = (evt) => handleActions(evt, cllbck, store, handlers);

  let { type } = event || {};
  if (handlers[type]) {
    try {
      return handlers[type](event, callback, store);
    } catch (err) {
      console.error(err);
      // big crash in handler...
      return cllbck({
        type: 'CRASH',
        payload: event
      }, callback);
    }

  }
  // else send to main? or do nothing?
  if (!event.type.startsWith('WORKER!')) return cllbck(event);
  else console.warn('Worker call action with WORKER!, to prevent infinite loop, this is not permit for now')
}
const STORE = {};// for caching
const getStore = () => STORE;
export default function initWorker(handlers) {
  self.addEventListener("message", (event) => handleActions(event.data, self.postMessage, getStore(), handlers));
}
