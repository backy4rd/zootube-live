const path = require('path');
const fs = require('fs');
const NodeMediaServer = require('node-media-server');
const auth = require('./auth');
const uploader = require('./uploader');
const { HTTP_PORT, RTMP_PORT, FFMPEG, MEDIA_ROOT, APP_NAME } = require('./env');

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
    mediaroot: MEDIA_ROOT,
  },
  trans: {
    ffmpeg: FFMPEG,
    tasks: [
      {
        app: APP_NAME,
        hls: true,
        hlsFlags: '[hls_time=6:hls_list_size=0:hls_flags=delete_segments]',
      },
    ],
  },
};

const nms = new NodeMediaServer(config);
if (fs.existsSync(path.resolve(__dirname, MEDIA_ROOT))) {
  fs.rmSync(path.resolve(__dirname, MEDIA_ROOT), { recursive: true });
}
nms.run();

nms.on('prePublish', async (id, streamPath, args, next) => {
  const session = nms.getSession(id);
  const streamId = streamPath.slice(streamPath.lastIndexOf('/') + 1);
  const streamKey = args.key;
  const hlsPath = path.join(__dirname, MEDIA_ROOT, APP_NAME, streamId);

  if (!streamId || !streamKey) {
    session.reject();
    return next();
  }
  if (fs.existsSync(hlsPath)) {
    if (fs.readdirSync(hlsPath).length !== 0) {
      session.reject();
      return next();
    }
  }
  try {
    await auth.goLive(streamId, streamKey);
  } catch (e) {
    console.log(e);
    session.reject();
  } finally {
    next();
  }
});

nms.on('donePublish', async (id, streamPath, args) => {
  const streamId = streamPath.slice(streamPath.lastIndexOf('/') + 1);
  const streamKey = args.key;
  const hlsPath = path.join(__dirname, MEDIA_ROOT, APP_NAME, streamId);

  try {
    await auth.offLive(streamId, streamKey);
    const videoPath = await uploader.mergeVideo(hlsPath);
    const videoResponse = await uploader.uploadVideo(videoPath);
    await uploader.processStreamedVideo({
      streamId,
      streamKey,
      video: videoResponse.data.video,
    });
  } catch (e) {
    console.log(e.message);
  } finally {
    fs.readdir(hlsPath, (err, files) => {
      if (err) return;
      files.forEach((filename) => fs.unlinkSync(path.join(hlsPath, filename)));
    });
  }
});
