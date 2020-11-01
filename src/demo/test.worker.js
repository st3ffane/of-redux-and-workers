import initWorker from '../worker';
import * as ACTIONS from './actions';

// handle messages from redux
const handlers = {
  [ACTIONS.HELLO]: (event, callback, store) => {
    let { payload, workerID } = event;
    console.log(payload);
    callback({
      type: ACTIONS.HELLO_SUCCESS,
      payload: 'bonjour aussi',
      workerID,
    })
  }
}
initWorker(handlers); // start worker thread