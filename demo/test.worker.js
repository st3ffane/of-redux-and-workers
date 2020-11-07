import initWorker from '../src/worker';
import * as ACTIONS from './actions';

// handle messages from redux
const handlers = {
  [ACTIONS.HELLO]: (event, callback) => {
    let { payload } = event;
    return Promise.resolve('Hello!');
  },
  [ACTIONS.SOMETHING]: (event, callback) => {
    return Promise.resolve({
      type: ACTIONS.SOMETHING_SUCCESS2,
      payload: 'I like to go out!'
    })
  },
  [ACTIONS.CRASH]: (event, callback) => {
    return Promise.reject('nope')
  },
  [ACTIONS.FORGET]: (event, callback) => {
    return new Promise((resolve, reject) => {
      // we can send data directly to redux with callback
      // must be a valid redux message (ie: got a type)
      callback({
        type: ACTIONS.FORGET_TMP,
        payload: 'hehehe'
      });

      resolve('end process')
    })
  }
}
initWorker(handlers); // start worker thread