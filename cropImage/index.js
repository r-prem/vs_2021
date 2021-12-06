// implementation based off of https://github.com/DnSu/aws-s3-lambda-crop-n-resize/blob/master/index.js

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const sharp = require('sharp');
const sizeOf = require('buffer-image-size');

exports.handler = async (event) => {
  const {key, boundingBox, emotion} = event;
  const params = {Bucket: process.env.Bucket, Key: key};
  const res = await getAndCrop(params, boundingBox);
  return {
    statusCode: 200,
    key: key,
    emotion: emotion,
    buffer: res
  }
};

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
          .toBuffer()
          .then(data => {
            resolve(data.toString('base64'))
          })
      }catch (e) {
        resolve();
      }
    })
  })
}
