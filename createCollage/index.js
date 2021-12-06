const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const {Duplex} = require('stream');
const joinImages = require('join-images');


exports.handler = async (event) => {
  const {images} = event;
  const bucket = process.env.Bucket;
  let buffers = [];
  let emotion = images[0].emotion;
  images.forEach(i => {
    buffers.push(Buffer.from(i.buffer.data));
  })
  const res = await doCreateCollage(emotion, buffers, bucket);
  return {
    statusCode: 200,
    emotion: emotion
  }
}
const doCreateCollage = async (emotion, buffers, bucket) => {
  return new Promise(async resolve => {
    let buffersEncoded = [];
    buffers.forEach(b => {
      buffersEncoded.push(Buffer.from(b, 'base64'))
    })
    let joined = await joinImages.joinImages(buffersEncoded, {direction: 'horizontal'});
    const buffered = await joined.toFormat('png');

    joinImages.joinImages(buffersEncoded, {direction: 'horizontal'}).then(async data => {

      let body = await data.toFormat('png');
      body = await body.toBuffer();
      const params = {
        Bucket: bucket,
        Key: emotion + '.png',
        Body: body
      }
      resolve(s3.upload(params).promise())
    })

  })
}

