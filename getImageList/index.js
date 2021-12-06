const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {

  console.log('called')
  const params = {Bucket: process.env.Bucket, Delimiter: '/'}
  const images = await getAllKeys(params);
  return {
    statusCode: 200,
    body: images
  }
};

const getAllKeys = async (params) => {
  let keys = [];
  const resp = await s3.listObjectsV2(params).promise();
  resp.Contents.forEach(r => keys.push(r.Key));
  return keys;
}
