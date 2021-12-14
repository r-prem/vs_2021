const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const {Duplex} = require('stream');
const joinImages = require('join-images');


exports.handler = async (event) => {
  const bucket = event.bucketOut;
  const images = JSON.parse(event.images);
  const emotion = Object.keys(images)[0]

  let imageArr = images[emotion];

  let buffers = [];
  imageArr.forEach(i => {
    buffers.push(Buffer.from(i.buffer, 'base64'));
  })
  const res = await doCreateCollage(emotion, buffers, bucket);
  return {
    result: 200
  }
}
const doCreateCollage = async (emotion, buffers, bucket) => {
  return new Promise(async resolve => {
    joinImages.joinImages(buffers, {direction: 'horizontal'}).then(async data => {
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

