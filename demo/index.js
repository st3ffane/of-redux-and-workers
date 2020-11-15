// Demo for Redux with workers


// redux utilities
import { createStore, applyMiddleware, combineReducers } from 'redux';
// workers utilities, in your code, will look like:
// import { workerAsPromiseMiddleware, workerMiddleware } from 'of-redux-and-workers';
import { workerAsPromiseMiddleware, workerMiddleware } from '../dist/index';
import * as ACTIONS from './actions';

// 1/ Create worker stuff -----------------------------------
import Worker from 'worker-loader!./test.worker.js';
const worker = new Worker();
// 2/ Create Redux reducers to handle our datas -------------
const app = (state = 'none', action) => {
  console.log('Reducer:', action.type, action)
  switch (action.type) {
    case ACTIONS.HELLO_SUCCESS: {
      return 'Button 1: ' + action.payload;
    }
    case ACTIONS.SOMETHING_SUCCESS2: {
      return 'Button 2: ' + action.payload;
    }
    case ACTIONS.SOMETHING_SUCCESS: {
      console.log('In the reducer:', action);
      return state;
    }
    case ACTIONS.CRASH_ERROR: {
      return 'Button 3: ' + action.payload;
    }
    // When creating the action, we do not set resolvers
    // for a send and forget call, the lib will auto create
    // [YOUR TYPE]_SUCCESS and [YOUR TYPE]_ERROR when worker call
    // resolve or reject
    case ACTIONS.FORGET_TMP_SUCCESS: {
      return 'Button 4: ' + action.payload;
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
const sayHello2 = () => ({
  type: ACTIONS.HELLO,
  payload: 'Bonjour',
  // empty resolvers will falback to generated ones
  resolvers: {}
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
// this action will not be processed by worker.as.promise as we do not
// add resolvers property in. Once this call will be complete
// an action with [YOUR TYPE]_SUCCESS and [YOUR TYPE]_ERROR will
// be dispatch to the store
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
  let button5 = document.getElementById('button5');
  let loader = document.getElementById('waiter');
  let result = document.getElementById('result');

  button.addEventListener('click', () => {
    loader.innerText = "wait while loading";
    // dispatch the action to the worker middlewares
    store.dispatch(sayHello())
      .then((res) => {
        // res is the result action of the worker call, but
        // once dispatch resolved, datas are already in your store!
        result.innerText = store.getState().app;
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
        console.log(res)
        result.innerText = store.getState().app;
      }).catch((res) => {
        console.error('fail', res)
      }).finally(() => {
        loader.innerText = "";
      })
  })
  button3.addEventListener('click', () => {
    loader.innerText = "wait while loading";
    store.dispatch(pleasCrash())
      .catch((res) => {
        result.innerText = store.getState().app;
      }).finally(() => {
        loader.innerText = "";
      })
  })
  button4.addEventListener('click', () => {
    loader.innerText = "not waiting for dispatch...";
    store.dispatch(sendAndForget());
    // wait 100ms and display what is in the store
    setTimeout(() => {
      result.innerText = store.getState().app;
    }, 100)
  })
  button5.addEventListener('click', () => {
    loader.innerText = "wait while loading";
    // dispatch the action to the worker middlewares
    store.dispatch(sayHello2())
      .then((res) => {
        // res is the result action of the worker call, but
        // once dispatch resolved, datas are already in your store!
        result.innerText = store.getState().app;
      }).catch((res) => {
        console.error('fail', res)
      }).finally(() => {
        loader.innerText = "";
      })
  })
});