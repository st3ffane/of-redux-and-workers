# Of Redux And Workers

> This lib is still a WIP. We are actually doing all the funny stuffs, like writing documentation, tutorials...

Web workers [middlewares](https://redux.js.org/advanced/middleware) for Redux.

```bash
npm install of-redux-and-workers
```

## Why Do I Need This?
> With a plain basic Redux store, you can only do simple synchronous updates by dispatching an action. Middlewares extends the store's abilities, and lets you write async logic that interacts with the store.

As a (all?) developer, I use the great [redux-thunk](https://github.com/reduxjs/redux-thunk) lib for this. And most of the time (you know, fetching datas from a server, [Yup](https://github.com/jquense/yup) a little bit and send result to the store), thunks are the recommended way to go. But sometimes, you will need to do some heavy processing on datas (think of image processing) and you cannot rely on thunks for this, because of how javascript works. Your code, even in a thunk, will always run on the main [event-loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop). And while your code compute, app stops responding to user events, and users complains *my computer freeze* or *app stop working for some times, then work again, then...*.

To prevent this behaviour, you should make you code run in a background thread while users click here and there, then send back results to the main UI for displaying. That's exactly what Web Workers are made for.
 
from [Mozilla MSDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers):

> Web Workers are a simple means for web content to run scripts in background threads. The worker thread can perform tasks without interfering with the user interface. In addition, they can perform I/O using XMLHttpRequest (although the responseXML and channel attributes are always null). Once created, a worker can send messages to the JavaScript code that created it by posting messages to an event handler specified by that code (and vice versa).

The aims of *of-redux-and-workers* is to link your redux store and your Web Workers togetheir, let you send actions to your worker, and let your worker dispatch results in your store.


## Installation

```bash
npm install of-redux-and-workers
```

## using worker with redux

simple exemple (only redux)
link to demo with react

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