// implementation based off of https://github.com/DnSu/aws-s3-lambda-crop-n-resize/blob/master/index.js

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sharp = require('sharp');
const sizeOf = require('buffer-image-size');

exports.handler = async (event) => {
  let {key, boundingBox, emotion, bucketIn, bucketOut} = event;
  const params = {Bucket: bucketIn, Key: key};
  boundingBox = JSON.parse(boundingBox);
  const res = await getAndCrop(params, boundingBox);

  key = key.split('.')[0];
  let newKey = key + '__cropped.png';
  const a = await saveToBucket(newKey, res, bucketIn)


  return {
    bucketIn: bucketIn,
    bucketOut: bucketOut,
    result: JSON.stringify({
              key: key,
              emotion: emotion,
              newKey: newKey
            })
    }
};
const saveToBucket = async (key, buffer,bucket) => {
  const params = {
    Bucket: bucket,
    Key: key,
    Body: buffer
  }
  return await s3.upload(params).promise();
}




const getAndCrop = async (params, boundingBox, key) => {
  return new Promise(async resolve => {
    await s3.getObject(params).promise().then(async res => {
      try {
        // get real coordinates from bounding box: https://docs.aws.amazon.com/rekognition/latest/dg/images-displaying-bounding-boxes.html
        let imgDimensions = sizeOf(res.Body);
        sharp(res.Body)
          .extract(
            {
              left: parseInt((boundingBox.Left * imgDimensions.width).toFixed(0)),
              top: parseInt((boundingBox.Top * imgDimensions.height).toFixed(0)),
              width: parseInt((boundingBox.Width * imgDimensions.width).toFixed(0)),
              height: parseInt((boundingBox.Height * imgDimensions.height).toFixed(0))
            }
          )
          .png()
          .toBuffer()
          .then((data,info) => {
            resolve(data)
          })
      }catch (e) {
        console.log(e)
        resolve();
      }
    })
  })
}
