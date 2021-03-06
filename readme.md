# Of Redux And Workers

> This lib is still a WIP. We are actually doing all the funny stuffs, like writing documentation, tutorials...

Web workers [middlewares](https://redux.js.org/advanced/middleware) for Redux.

```bash
npm install of-redux-and-workers
```

## Why Do I Need This?

> With a plain basic Redux store, you can only do simple synchronous updates by dispatching an action. Middlewares extends the store's abilities, and lets you write async logic that interacts with the store.

As a (all?) developer, I use the great [redux-thunk](https://github.com/reduxjs/redux-thunk) lib for this. And most of the time (you know, fetching datas from a server, [Yup](https://github.com/jquense/yup) a little bit and send result to the store), thunks are the recommended way to go. But sometimes, you will need to do some heavy processing on datas (think of image processing) and you cannot rely on thunks for this, because of how javascript works. Your code, even in a thunk, will always run on the main [event-loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop). And while your code compute, app stops responding to user events, and users complains _my computer freeze_ or _app stop working for some times, then work again, then..._.

To prevent this behaviour, you should make your heavy-duty code run in a background thread while users click here and there, then send back results to the main UI for displaying. That's exactly what Web Workers are made for.

from [Mozilla MSDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers):

> Web Workers are a simple means for web content to run scripts in background threads. The worker thread can perform tasks without interfering with the user interface. In addition, they can perform I/O using XMLHttpRequest (although the responseXML and channel attributes are always null). Once created, a worker can send messages to the JavaScript code that created it by posting messages to an event handler specified by that code (and vice versa).

The aims of _of-redux-and-workers_ is to link your redux store and your Web Workers togetheir, let you send actions to your worker, and let your worker dispatch results in your store easily.

## Installation

```bash
npm install of-redux-and-workers
```

## using worker with redux

> You can find a simple application using webpack, worker-loader, redux and web workers in [demo folder](https://github.com/st3ffane/of-redux-and-workers/tree/main/demo)

> If you want to see this lib in a react app, you can check [react demo git](https://github.com/st3ffane/oraw-demo).

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
import { PREFIX, SUCCESS, ERROR } from "of-redux-and-workers";
export const HELLO = PREFIX + "HELLO";
// those 2 actions will be generated by workerMiddleware on handler resolve/reject
export const HELLO_SUCCESS = "HELLO" + SUCCESS;
export const HELLO_ERROR = "HELLO" + ERROR;
```

- main app file: creating store, reducers, middlewares and app related stuff.

```js
// app.js
// redux utilities
import { createStore, applyMiddleware, combineReducers } from "redux";
import * as TYPES from "./types";
import {
  workerAsPromiseMiddleware,
  workerMiddleware,
} from "of-redux-and-workers";

// 1/ Create worker stuff
import Worker from "worker-loader!./test.worker.js";
const worker = new Worker();
// initializing our worker middleware
const workerMddwr = workerMiddleware(worker);
// 2/ Create Redux reducers to handle our datas
const app = (state = "none", action) => {
  switch (action.type) {
    case TYPES.HELLO_SUCCESS: {
      return "Button 1: " + action.payload;
    }
    // ... others
  }
};
const reducers = combineReducers({
  app: app,
});
// 3/ Create redux store for our datas
const store = createStore(
  reducers,
  applyMiddleware(
    // worker as promise must be set **BEFORE** workerMiddleware!
    workerAsPromiseMiddleware,
    workerMddwr
  )
);

// 4/ Add some actions
const sayHello = () => ({
  type: TYPES.HELLO,
  payload: "Bonjour",
  resolvers: {
    resolveOn: TYPES.HELLO_SUCCESS,
    rejectOn: TYPES.HELLO_ERROR,
  },
});

// 5/ do some stuff in UI
window.addEventListener("load", () => {
  // get UI components in page
  let button = document.getElementById("button");
  button.addEventListener("click", () => {
    loader.innerText = "wait while loading";
    // dispatch the action to the worker middlewares
    store
      .dispatch(sayHello())
      .then((res) => {
        // res is the result action of the worker call, but
        // once dispatch resolved, datas are already in your store!
        result.innerText = store.getState().app;
      })
      .catch((res) => {
        console.error("fail", res);
      })
      .finally(() => {
        loader.innerText = "";
      });
  });
});
```

- finally, Web worker code

```js
// test.worker.js
import { initWorker } from "of-redux-and-workers";
import * as TYPES from "./types";

// handle messages from redux
const handlers = {
  [TYPES.HELLO]: (action, dispatch) => {
    return Promise.resolve("Hello!");
  },
};
initWorker(handlers); // start worker thread
```

OK, let's explain a little more those two last files.

#### app.js

This file is the main UI thread (in a sens), it will hold your data, respond to user actions/events, update UI...

- We import 2 methods from the library:

  ```js
  import {
    workerAsPromiseMiddleware,
    workerMiddleware,
  } from "of-redux-and-workers";
  ```

  - **workerMiddleware**: this middleware will send the actions to the web worker. As this method need a way to _understand_ which actions to send, you must prefix the action.type value with a special string: **WORKER!**. In our exemple, we create a type **WORKER!HELLO** in our types.js file.\
    For simplicity, we import this prefix from the library too.

  ```js
  import { PREFIX, SUCCESS, ERROR } from "of-redux-and-workers";
  export const HELLO = PREFIX + "HELLO";
  export const HELLO_SUCCESS = "HELLO" + SUCCESS;
  export const HELLO_ERROR = "HELLO" + ERROR;
  ```

* **workerAsPromiseMiddleware**: this middleware will let you _wait_ for the action to finish in the worker. For an action to be awaitable, the action.type value must start with **WORKER!** prefix (obviously), and the action must have a special property **resolvers** -more on this later. This middleware is not mandatory (if you just want to do some send-and-forget and only rely on your state), but it can be handy for loaders by exemple.

* We load and initialize our web worker code (here with worker-loader webpack plugin)

  ```js
  import Worker from "worker-loader!./test.worker.js";
  const worker = new Worker();
  ```

* Then we initialize the workerMiddleware. Calling this method with your web worker as argument will send back the "real" redux middleware, and will take care of the glue between your store and the worker.
  ```js
  const workerMddwr = workerMiddleware(worker);
  ```
* And finally, create the store, applying our 2 middlewares.
  ```js
  const store = createStore(
    reducers,
    applyMiddleware(workerAsPromiseMiddleware, workerMddwr)
  );
  ```
  Note: if you want to use the workerAsPromiseMiddleware, you must add it **before** the workerMiddleware in the list.

Et voila! You are now ready to dispatch actions to your worker!

#### test.worker.js

- First, we import the initWorker method from the library. It's responsible to glue the web worker message handling, receiving and sending messages to the UI thread.\
  We also import the actions type for our worker reducer.

```js
import { initWorker } from "of-redux-and-workers";
import * as TYPES from "./types";
```

Then we create a simple 'redux like' reducer to handle the actions sent by redux. It's just a map between the action types and a method to execute.

```js
const handlers = {
  [TYPES.HELLO]: (action, dispatch) => {
    return Promise.resolve("Hello!");
  },
};
```

Those methods takes 2 parameters:

- **[Object] action**: the action sent by redux to our worker, a classical action in redux world (ie, with a type property).
- **[Function] dispatch**: a direct access to your redux store. You can call this function with a classical redux action, and it will be send to your store for processing. Same signature as redux dispatch method.

A worker handler **must** return a Promise as result. If promise resolve, a success action with results will be sent back to your store, if promise reject, an error action will be sent.

and finally, we initialize the worker.

```js
initWorker(handlers);
```

## workerMiddleware

### sending an action to the worker

This middleware need a way to _understand_ which actions need to be sent to the worker (and which must not), so you must prefix the action.type value with a special string: _WORKER!_ (exported as **PREFIX** from the lib).\
Once a WORKER! action is sent, this middleware will send it to the web worker and will create 2 actions type to handle the response:

- if the handler promise resolve or reject, a success/error action will be dispatched with type of action (without prefix) + SUCCESS/ERROR postfix appended. For exemple, if you dispatch a _WORKER!HELLO_, and handler resolve, a HELLO_SUCCESS will be dispatched with the results, or if handler reject, a HELLO_ERROR is dispatched.

> You must not send back from the worker an action which type starts with PREFIX. Never. If you do so, a warn will appear in your console and the response action will be ignored (wich is better than an infinite loop. Thanks Mathieu Leddet!)

### dispatching from the worker

You will sometimes need to send back to your store partial results or progress informations on what's going on. To do so, you can dispatch actions directly to your redux-store with the dispatch argument of the handler.

```js
  // define some actions
  import { PREFIX, SUCCESS, ERROR } from "of-redux-and-workers";
  export const HELLO = PREFIX + "HELLO";
  export const HELLO_SUCCESS = "HELLO" + SUCCESS;
  export const HELLO_ERROR = "HELLO" + ERROR;
  // we add an action to handle progress in our store
  export const PROGRESSING = "SO_SOME_PROGRESS";
  // ...

  // my redux reducer
  // ...
  const process = (state = 0, action) => {
    switch (action.type) {
      case TYPES.PROGRESSING: {
        // save progress in your state.
        return action.payload;
      }
    }
  };
  const reducers = combineReducers({
    app: app,
    process: process, // add it to redux store
  });

  // worker handler
  const handlers = {
  [TYPES.HELLO]: (action, dispatch) => {
    return doFirstThing()
    .then((data)=>{
      // send some progress infos to redux
      dispatch({
        type: TYPES.PROGESSING,
        payload: 20
      });
      return doOtherThing(data);
    }).then((data)=>{
      // send some progress infos to redux
      dispatch({
        type: TYPES.PROGESSING,
        payload: 100
      });
      return data; // will return results with type HELLO_SUCCESS
    });
  };
```
The resulting action of workerMiddleware have the form:
```ts
{
  type: [String] the action type
  payload: [Object] here live the dragons and your datas returned by the handler promise
}
```
## workerAsPromiseMiddleware

The idea behind this middleware is to mimic redux-thunk behaviour: dispatch an action to the web worker and wait until it finished to continue processing.

### How to

For a worker action to be promised, you must add a **resolvers** property to the action. When a worker handler resolve/reject, it will send back as action.type the corresponding one:

```js
dispatch({
  type: [String][prefix: WORKER!] type,
  payload: [any] myDatas,
  resolvers:{
    resolveOn: [String | Array[String]] resolve actions type *optionnal*,
    rejectOn: [String | Array[String]] reject actions type *optionnal*,
  }
})
```

> Like before, you can dispatch other actions in your worker handler, and those actions will **not** resolve/reject your promise.

#### Simple case: empty resolver

If the auto-created actions are sufficent for your needs, you can just add an empty resolvers object to your action, and resolve/reject types will be the generated ones (with SUCCESS or ERROR subfix).

```js
dispatch({
  type: [String][prefix: WORKER!] type,
  payload: [any] myDatas,
  resolvers:{}
});
```

#### Custom resolver type

If the auto-generated response types do not match your needs, you can override them by setting a string value to resolveOn and/or rejectOn properties:

```js
dispatch({
  type: [String][prefix: WORKER!] type,
  payload: [any] myDatas,
  resolvers:{
    resolveOn: 'MY_CUSTOM_SUCCESS_TYPE', // will be dispatched on handler resolve
    rejectOn: 'MY_CUSTOM_ERROR_TYPE', // will be dispatched on handler reject
  }
})
```

#### Advanced: Multiple resolvers types

There are times when a worker handler needs to resolve/reject differently (on an action.type point of view) depending on what happens.\
To handle this scenario, you can had a string array as resolveOn/rejectOn properties.

```js
dispatch({
  type: [String][prefix: WORKER!] type,
  payload: [any] myDatas,
  resolvers:{
    resolveOn: ['MY_CUSTOM_SUCCESS_TYPE_1', 'MY_CUSTOM_SUCCESS_TYPE_2'],
    rejectOn: ['MY_CUSTOM_ERROR_TYPE_1', 'MY_CUSTOM_ERROR_TYPE_2'],
  }
})
```

To resolve a worker handler with one of the custom type (or reject), your worker handler must return a valid redux action (ie: an object with a _type_ property) with one of this types. Let's show an exemple of this:

```js
// worker handler: doing some stuff...
const handlers = {
  'WORKER!DO_STUFF': (action, dispatch) => {
    // start something heavy
    return doSomething()
    .then((result)=>{
      // depending on result code we dispatch custom actions to redux
      if(result.code === 200) return {type: 'ALL_IS_OK', payload: result.data};
      else return {type: 'COULD_BE_BETTER'};

    }).catch((err)=>{
      // depending on error.code, we dispatch different errors to redux
      // note that custom error codes must reject to be treated as error
      // if you return the action, it will be treaetd as successfull
      if(err.code === 404) return Promise.reject({ type: 'ERROR_DO_NOT_EXISTS'});
      else return Promise.reject({ type: 'ERROR_UNKNOWN'})
    })
  }
};

// in your UI
button.addEventListener("click", () => {
  // dispatch the action to the worker middlewares
  store
    .dispatch({
      type: 'WORKER!DO_STUFF',
      payload: [any] myDatas,
      resolvers:{
        resolveOn: ['ALL_IS_OK', 'COULD_BE_BETTER'],
        rejectOn: ['ERROR_UNKNOWN', 'ERROR_DO_NOT_EXISTS'],
      }
    }).then((res) => {
      // our store get updated, do something
    })
    .catch((res) => {
      // we got an error, store get updated too!
    });
});

// your reducer
const process = (state = '', action) => {
    switch (action.type) {
      case 'ALL_IS_OK': {
        // save progress in your state.
        return "everything's fine";
      }
      case 'COULD_BE_BETTER': {
        // save progress in your state.
        return "ok";
      }
      case 'ERROR_UNKNOWN': {
        // save progress in your state.
        return "Oops, Houston, we got a problem";
      }
      case 'ERROR_DO_NOT_EXISTS': {
        // save progress in your state.
        return "Do not found what you were looking for.";
      }
    }
  };
```

> If you resolve/reject an action without specifiying the type property (so, not a valid redux action), your worker handler will resolve/reject with the first item in the array. In our case, will resolve with 'ALL_IS_OK' and/or reject with 'ERROR_UNKNOWN'

> **WHAT IF?** What if you dispatch an action type (with dispatch function) using a type marked in resolvers.resolveOn? The action will be sent to your redux store, but the promise will **not** resolve.

> **WHAT IF?** What if a worker handler resolve with an action object which type is not listed in resolvers.resolveOn? Your action will be processed by the redux-store, but worker middleware will not be aware that the process is over, and will not resolve the promise. If you are stuck with a never ending promise, check that the action.type return by the worker handler is listed in the resolvers.resolveOn (simple string or array)

## Scripts

- **Unit testing and code coverage**: results will be generated in _artifacts_ folder.

```bash
npm run report
```

- **Demo**: a basic redux app (no react in it! If you look for a demo with react inside, check ...) to illustrate how to use this lib.

```bash
npm run start
```

- **Build**: build an UMD version

```bash
npm run build
```

## Thanks

- Thanks to Mathieu Leddet for feedback and bug tracking
- And thanks to my company [Done HUI](https://www.meetings.monster/) for allowing me to create this open-source library from our work.
