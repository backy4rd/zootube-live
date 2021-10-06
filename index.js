const NodeMediaServer = require('node-media-server');
const auth = require('./auth');

const PORT = parseInt(process.env.PORT) || 80;

const config = {
  // logType: 0,
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: PORT,
  },
};

const nms = new NodeMediaServer(config);
nms.run();

nms.on('prePublish', async (id, streamPath, args, next) => {
  const session = nms.getSession(id);
  const streamId = streamPath.slice(streamPath.lastIndexOf('/') + 1);
  const streamKey = args.key;
  if (!streamId || !streamKey) {
    session.reject();
  }
  try {
    await auth.goLive(streamId, streamKey);
  } catch (e) {
    session.reject();
  } finally {
    next();
  }
});

nms.on('donePublish', async (id, streamPath, args) => {
  const streamId = streamPath.slice(streamPath.lastIndexOf('/') + 1);
  const streamKey = args.key;
  try {
    await auth.offLive(streamId, streamKey);
  } catch (e) {
    console.log(e);
  }
});
