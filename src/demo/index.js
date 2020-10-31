// Demo for Redux with workers

// Use case 1: add a simple worker and call it on click

// redux utilities
import { createStore, applyMiddleware, combineReducers } from 'redux';
// workers utilities, in your code, will look like:
// import { workerAsPromiseMiddleware, workerMiddleware } from 'of-redux-and-workers';
import { workerAsPromiseMiddleware, workerMiddleware } from '../index';

// 1/ Create worker stuff -----------------------------------
import Worker from 'worker-loader!./test.worker.js';
const worker = new Worker();

// tmp
worker.addEventListener('message', function (event) {
  console.log('from worker', event.data)
});


// 2/ Create Redux reducers to handle our datas -------------
const app = (state = 'none', action) => {
  switch(action.type){
    case 'HELLO':{
      return 'hello'
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
  // applyMiddleware(
  //   workerAsPromiseMiddleware, // worker as promise must be set **BEFORE** workerMiddleware!
  //   workerMiddleware({ // worker(s) initialisations

  // })),
);

// 4/ Add some actions

// Demo related UI stuff
window.addEventListener('load', ()=>{
  // get UI components in page
  let button = document.getElementById('button');
  let loader = document.getElementById('waiter');
  let result = document.getElementById('result');

  button.addEventListener('click', ()=>{
    worker.postMessage('bonjour');
  })
});