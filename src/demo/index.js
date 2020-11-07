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
    case ACTIONS.FORGET_TMP: {
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
const sayHello = () => ({
  type: ACTIONS.HELLO,
  payload: 'Bonjour',
  resolvers: {
    resolveOn: ACTIONS.HELLO_SUCCESS,
    rejectOn: ACTIONS.HELLO_ERROR
  }
})
const saySomething = () => ({
  type: ACTIONS.SOMETHING,
  payload: 'Bonjour',
  resolvers: {
    resolveOn: [ACTIONS.SOMETHING_SUCCESS, ACTIONS.SOMETHING_SUCCESS2],
    rejectOn: ACTIONS.SOMETHING_ERROR
  }
})
const pleasCrash = () => ({
  type: ACTIONS.CRASH,
  payload: 'Bonjour',
  resolvers: {
    resolveOn: ACTIONS.CRASH_SUCCESS,
    rejectOn: ACTIONS.CRASH_ERROR
  }
})
const sendAndForget = () => ({
  type: ACTIONS.FORGET,
  payload: 'Bonjour', // no resolvers set here, dispatch will not return a promise!
})
// Demo related UI stuff
window.addEventListener('load', () => {
  // get UI components in page
  let button = document.getElementById('button');
  let button2 = document.getElementById('button2');
  let button3 = document.getElementById('button3');
  let button4 = document.getElementById('button4');
  let loader = document.getElementById('waiter');
  let result = document.getElementById('result');

  button.addEventListener('click', () => {
    loader.innerText = "wait while loading";
    store.dispatch(sayHello())
      .then((res) => {
        console.log('Finish', res)
        result.innerText = res.payload;
      }).catch((res) => {
        console.error('fail', res)
      }).finally(() => {
        loader.innerText = "";
      })
  })
  button2.addEventListener('click', () => {
    loader.innerText = "wait while loading";
    store.dispatch(saySomething())
      .then((res) => {
        console.log('Finish', res)
        result.innerText = res.payload;
      }).catch((res) => {
        console.error('fail', res)
      }).finally(() => {
        loader.innerText = "";
      })
  })
  button3.addEventListener('click', () => {
    loader.innerText = "wait while loading";
    store.dispatch(pleasCrash())
      .then((res) => {
        console.log('Finish', res)
        result.innerText = res.payload;
      }).catch((res) => {
        console.error('fail', res)
      }).finally(() => {
        loader.innerText = "";
      })
  })
  button4.addEventListener('click', () => {
    loader.innerText = "not waiting for dispatch...";
    store.dispatch(sendAndForget())
  })
});