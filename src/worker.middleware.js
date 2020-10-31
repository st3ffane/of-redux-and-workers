/**
 * Background process middleware for application/redux
 */
import doneWorker from '../worker/index'; // link to web-worker or ipc
import logger from '../logger';

export default (store) => {
  // init worker with store dispatch
  logger.info('Creating worker middleware')
  const worker = doneWorker(store.dispatch);

  return next => action => {
    logger.silly('Action ' + action.type)
    console.log('Action ' + action.type)
    let { type } = action;
    if (type.startsWith('WORKER_')) {
      // send to process
      console.log('Send command to worker' + type)
      // add meta to action
      /*action.meta = {
        token: store.getState().user.token
      }*/
      return worker.process(action)
        .then((result) => {
          if (result && result.type) next(result);// if something, pass the new action *not implemented yet
          else next(action);// if no response from worker, pass action to others
        })
        .catch((err) => {
          console.log('Error on process:', err)
          logger.error(err);
          // what to do next?
          next(action); // go for next
        });
    } else {
      // not for worker, pass
      return next(action); // go for next
    }

  }
}