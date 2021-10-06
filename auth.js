const request = require('request-promise');

const API_SERVER_ENDPOINT =
  process.env.API_SERVER_ENDPOINT || 'http://127.0.0.1';

module.exports.goLive = function (streamId, streamKey) {
  return request.patch(API_SERVER_ENDPOINT + '/streams/' + streamId, {
    form: {
      stream_key: streamKey,
      status: 'live',
    },
  });
};

module.exports.offLive = function (streamId, streamKey) {
  return request.patch(API_SERVER_ENDPOINT + '/streams/' + streamId, {
    form: {
      stream_key: streamKey,
      status: 'off',
    },
  });
};
