module.exports = {
  API_SERVER_ENDPOINT: process.env.API_SERVER_ENDPOINT || 'http://127.0.0.1',
  HTTP_PORT: parseInt(process.env.HTTP_PORT) || 80,
  RTMP_PORT: parseInt(process.env.RTMP_PORT) || 1935,

  FFMPEG: '/usr/bin/ffmpeg',
  MEDIA_ROOT: './media',
  APP_NAME: 'live',
};
