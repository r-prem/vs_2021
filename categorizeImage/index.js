const AWS = require('aws-sdk');
const rek = new AWS.Rekognition();

exports.handler = async (event) => {


  const {image} = event;
  console.log(event);
  const params = {
    Image: {
      S3Object: {
        Bucket: process.env.bucket,
        Name: image
      }
    },
    "Attributes": ["ALL"]
  }
  const resp = await rek.detectFaces(params).promise();
  console.log(resp)
  const response = {
    statusCode: 200,
    body: {
      image: image,
      emotion: resp.FaceDetails[0].Emotions[0].Type,
      boundingBox: resp.FaceDetails[0].BoundingBox
    },
  };
  return response;
};
