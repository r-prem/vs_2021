const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {

  const {bucketIn, bucketOut} = event;
  const params = {Bucket: bucketIn, Delimiter: '/'}
  const images = await getAllKeys(params);
  return {
    imageList: images,
    length: images.length,
    bucketIn: bucketIn,
    bucketOut: bucketOut
  }

};

const getAllKeys = async (params) => {
  let keys = [];
  const resp = await s3.listObjectsV2(params).promise();
  resp.Contents.forEach(r => keys.push(r.Key));
  return keys;
}
