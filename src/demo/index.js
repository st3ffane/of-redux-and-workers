// Demo for Redux with workers

// Use case 1: add a simple worker and call it on click

// redux utilities
import { createStore, applyMiddleware, combineReducers } from 'redux';
// workers utilities, in your code, will look like:
// import { workerAsPromiseMiddleware, workerMiddleware } from 'of-redux-and-workers';
import { workerAsPromiseMiddleware, workerMiddleware } from '../index';
import * as ACTIONS from './actions';

// 1/ Create worker stuff -----------------------------------
import Worker from 'worker-loader!./test.worker.js';
const worker = new Worker();

// 2/ Create Redux reducers to handle our datas -------------
const app = (state = 'none', action) => {
  switch (action.type) {
    case ACTIONS.HELLO_SUCCESS: {
      return action.payload;
    }
    default: return state;
  }
}
const reducers = combineReducers({
  'app': app
});
// 3/ Create redux store for our datas -----------------------
const store = createStore(
  reducers,
  applyMiddleware(
    workerAsPromiseMiddleware, // worker as promise must be set **BEFORE** workerMiddleware!
    workerMiddleware(worker)),
);

// 4/ Add some actions

// Demo related UI stuff
window.addEventListener('load', () => {
  // get UI components in page
  let button = document.getElementById('button');
  let loader = document.getElementById('waiter');
  let result = document.getElementById('result');

  button.addEventListener('click', () => {
    store.dispatch({
      type: ACTIONS.HELLO,
      payload: 'Bonjour',
      resolvers: {
        resolveOn: ACTIONS.HELLO_SUCCESS,
        rejectOn: ACTIONS.HELLO_ERROR
      }
    }).then((res) => {
      console.log('Finish', res)
      result.innerText = res.payload;
    }).catch((res) => {
      console.error('fail', res)
    })
  })
});