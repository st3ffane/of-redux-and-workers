import { initWorker } from '../dist/index';
import * as ACTIONS from './actions';

// handle messages from redux
const handlers = {
  [ACTIONS.HELLO]: (action, dispatch) => {
    let { payload } = action;
    return Promise.resolve('Hello!');
  },
  [ACTIONS.SOMETHING]: (action, dispatch) => {
    return Promise.resolve({
      type: ACTIONS.SOMETHING_SUCCESS2,
      payload: 'I like to go out!'
    })
  },
  [ACTIONS.CRASH]: (action, dispatch) => {
    return Promise.reject('nope')
  },
  [ACTIONS.FORGET]: (action, dispatch) => {
    return new Promise((resolve, reject) => {
      // we can send data directly to redux with dispatch
      // must be a valid redux message (ie: got a type)
      dispatch({
        type: ACTIONS.FORGET_TMP,
        payload: 'hehehe'
      });

      resolve('end process')
    })
  }
}
initWorker(handlers); // start worker thread