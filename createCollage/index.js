const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sharp = require('sharp');
const joinImages = require('join-images');


exports.handler = async (event) => {
  console.log(event)
  const bucket = event.bucketOut;
  const bucketIn = event.bucketIn;
  const images = JSON.parse(event.images);
  const emotion = Object.keys(images)[0]
  let buffers = [];
  let imageArr = images[emotion];
  let loadedImages = await loadImages(imageArr, bucketIn);
  loadedImages.forEach(l => {
    buffers.push(l.Body)
  })
  const res = await doCreateCollage(emotion, buffers, bucket);
  return {
    result: 200
  }
}
const doCreateCollage = async (emotion, buffers, bucket) => {
  try {
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
      }).catch(err => {
        console.log(err)
      })

    })
  }catch (e) {
    console.log(e.toString())
  }

}

const loadImages = async (images, bucket) => {
  let paramsArr = [];
  let promiseArr = [];

  images.forEach(i => {
    paramsArr.push({Bucket: bucket, Key: i.newKey})
  })
  paramsArr.forEach(p => {
    promiseArr.push(s3.getObject(p).promise())
  })
  return new Promise(resolve => {
    Promise.all(promiseArr).then(res => {
      resolve(res);
    })
  })


}
