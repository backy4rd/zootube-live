const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const request = require('request-promise');

const { API_SERVER_ENDPOINT, FFMPEG } = require('./env');

module.exports.mergeVideo = function (hlsPath) {
  const m3u8Path = path.join(hlsPath, 'index.m3u8');
  const mergedPath = path.join(hlsPath, 'index.mp4');

  return new Promise((resolve, reject) => {
    if (fs.existsSync(m3u8Path)) {
      const argv = ['-i', m3u8Path, '-c', 'copy', mergedPath];
      const ffmpegTask = spawn(FFMPEG, argv);
      ffmpegTask.on('close', () => resolve(mergedPath));
      ffmpegTask.on('error', reject);
      ffmpegTask.on('disconnect', reject);
    } else {
      reject();
    }
  });
};

module.exports.uploadStreamedVideo = function ({
  streamId,
  streamKey,
  videoPath,
}) {
  return request.post(API_SERVER_ENDPOINT + '/streams/', {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    formData: {
      stream_id: streamId,
      stream_key: streamKey,
      video: fs.createReadStream(videoPath),
    },
  });
};
