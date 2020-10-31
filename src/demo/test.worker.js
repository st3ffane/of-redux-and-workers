self.addEventListener('message', function (event) {
  console.log(event.data);
  self.postMessage('hello you too')
});