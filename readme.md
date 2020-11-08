# Of Redux And Workers

> This lib is still a WIP. We are actually doing all the funny stuffs, like writing documentation, tutorials...

Web workers [middlewares](https://redux.js.org/advanced/middleware) for Redux.

```bash
npm install of-redux-and-workers
```

## Why Do I Need This?
> With a plain basic Redux store, you can only do simple synchronous updates by dispatching an action. Middlewares extends the store's abilities, and lets you write async logic that interacts with the store.

As a (all?) developer, I use the great [redux-thunk](https://github.com/reduxjs/redux-thunk) lib for this. And most of the time (you know, fetching datas from a server, [Yup](https://github.com/jquense/yup) a little bit and send result to the store), thunks are the recommended way to go. But sometimes, you will need to do some heavy processing on datas (think of image processing) and you cannot rely on thunks for this, because of how javascript works. Your code, even in a thunk, will always run on the main [event-loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop). And while your code compute, app stops responding to user events, and users complains *my computer freeze* or *app stop working for some times, then work again, then...*.

To prevent this behaviour, you should make your heavy-duty code run in a background thread while users click here and there, then send back results to the main UI for displaying. That's exactly what Web Workers are made for.
 
from [Mozilla MSDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers):

> Web Workers are a simple means for web content to run scripts in background threads. The worker thread can perform tasks without interfering with the user interface. In addition, they can perform I/O using XMLHttpRequest (although the responseXML and channel attributes are always null). Once created, a worker can send messages to the JavaScript code that created it by posting messages to an event handler specified by that code (and vice versa).

The aims of *of-redux-and-workers* is to link your redux store and your Web Workers togetheir, let you send actions to your worker, and let your worker dispatch results in your store easily.


## Installation

```bash
npm install of-redux-and-workers
```

## using worker with redux

> You can find a simple application using webpack, worker-loader, redux and web workers in [demo folder](https://github.com/st3ffane/of-redux-and-workers/tree/main/demo)

> If you want to see this lib in a react app, you can check [react demo git](https://github.com/st3ffane/of-redux-and-workers/tree/main/demo) and take a look at [my super tutorial not yet written](https://github.com/st3ffane/of-redux-and-workers/tree/main/demo).

First of all, I will assume your are familiar with [webpack](https://webpack.js.org/) and its basic configuration. Second, I prefer (but that's not mandatory) load workers with [worker-loader](https://github.com/webpack-contrib/worker-loader) plugin, so damn easy, but it's up to you.
If you don't know how to set up your configuration, you can check the demo [webpack.config.js](https://github.com/st3ffane/of-redux-and-workers/blob/main/webpack.config.js) to see how I do it (that's just an exemple, not production ready).

Basic application: it consists of 4 files:
- our basic html index file, to display app
```html
<html>
<body>
  <div>
    <button id="button">Click me!</button>
    <div id="waiter"></div>
    <div id="result"></div>
  </div>
</body>
</html>
```
- action types definition: as those constants should be accessible in main app and in the web worker, it's better to put them in a dedicated file.
```js
// types.js
// the prefix "WORKER!" will tell the middleware to send the action
// to your web-worker
export const HELLO = 'WORKER!HELLO';
export const HELLO_SUCCESS = 'HELLO_SUCCESS';
```
- main app file creating store, reducers, middlewares and app related stuff.
```js
// app.js
// redux utilities
import { createStore, applyMiddleware, combineReducers } from 'redux';
import * as TYPES from './types';
import { workerAsPromiseMiddleware, workerMiddleware } from 'of-redux-and-workers';

// 1/ Create worker stuff
import Worker from 'worker-loader!./test.worker.js';
const worker = new Worker();
// 2/ Create Redux reducers to handle our datas
const app = (state = 'none', action) => {
  switch (action.type) {
    case TYPES.HELLO_SUCCESS: {
      return 'Button 1: ' + action.payload;
    }
    // ... others
  }
}
const reducers = combineReducers({
  'app': app
});
// 3/ Create redux store for our datas
const store = createStore(
  reducers,
  applyMiddleware(
    // worker as promise must be set **BEFORE** workerMiddleware!
    workerAsPromiseMiddleware, 
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

// 5/ do some stuff in UI
// Demo related UI stuff
window.addEventListener('load', () => {
  // get UI components in page
  let button = document.getElementById('button');
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
});
```
- finally, Web worker code
```js
// test.worker.js
import { initWorker } from 'of-redux-and-workers';
import * as ACTIONS from './actions';

// handle messages from redux
const handlers = {
  [ACTIONS.HELLO]: (action, dispatch) => {
    return Promise.resolve('Hello!');
  },
}
initWorker(handlers); // start worker thread
```

OK, let's explain a little bit.
@TO FINISH...

## More

- **Unit testing and code coverage**: results will be generated in *artifacts* folder.
```bash
npm run report
```

- **Demo**: a basic redux app (no react in it! If you look for a demo with react inside, check ...) to illustrate how to use this lib.
```bash
npm run start
```
- **Build**
```bash
npm run build
```

## Comming soon
- use of multiple workers and dispatch to all/one/subgroup? the actions.
- wait for responses from all/subgroup of workers before resolving promises.