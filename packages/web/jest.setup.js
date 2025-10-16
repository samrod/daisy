const fetch = require('node-fetch');
const Response = fetch.Response;
const Request = fetch.Request;
const Headers = fetch.Headers;

if (typeof global !== 'undefined') {
  if (typeof global.fetch === 'undefined') global.fetch = fetch;
  if (typeof global.Response === 'undefined') global.Response = Response;
  if (typeof global.Request === 'undefined') global.Request = Request;
  if (typeof global.Headers === 'undefined') global.Headers = Headers;
  if (typeof global.console === 'undefined') global.console = {};
  global.console.warn = global.console.warn || jest.fn();
  global.console.log = global.console.log || jest.fn();
  global.window = global.window || {};
  global.window.location = global.window.location || {
    ancestorOrigins: { contains: () => false, item: () => null, length: 0, [Symbol.iterator]: function* () {} },
    hash: '', host: '', hostname: '', href: '', origin: '', pathname: '', port: '', protocol: '', search: '',
    assign: () => {}, reload: () => {}, replace: () => {}
  };
}
