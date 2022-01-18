const AWS = require('aws-sdk');
const rek = new AWS.Rekognition();

exports.handler = async (event) => {


  const {image, bucketIn, bucketOut} = event;
  const params = {
    Image: {
      S3Object: {
        Bucket: bucketIn,
        Name: image
      }
    },
    "Attributes": ["ALL"]
  }
  const resp = await rek.detectFaces(params).promise();
  const response = {
    image: image,
    emotion: resp.FaceDetails[0].Emotions[0].Type,
    boundingBox: JSON.stringify(resp.FaceDetails[0].BoundingBox),
    bucketIn: bucketIn,
    bucketOut: bucketOut
  };
  return response;
};
