const NodeMediaServer = require('node-media-server');
const auth = require('./auth');

const HTTP_PORT = parseInt(process.env.PORT) || 80;
const RTMP_PORT = parseInt(process.env.PORT) || 1935;

const config = {
  // logType: 0,
  rtmp: {
    port: RTMP_PORT,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: HTTP_PORT,
    mediaroot: './media',
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=6:hls_list_size=0:hls_flags=delete_segments]',
      },
    ],
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
