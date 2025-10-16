const fetch = require('node-fetch');
const Response = fetch.Response;
const Request = fetch.Request;
const Headers = fetch.Headers;

if (typeof global !== 'undefined') {
  if (typeof global.fetch === 'undefined') global.fetch = fetch;
  if (typeof global.Response === 'undefined') global.Response = Response;
  if (typeof global.Request === 'undefined') global.Request = Request;
  if (typeof global.Headers === 'undefined') global.Headers = Headers;
}
