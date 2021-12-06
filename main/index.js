const AWS = require('aws-sdk');
AWS.config.region = process.env.region;
const s3 = new AWS.S3();
const lambda = new AWS.Lambda();

/** Responsible for coordinating the entire project **/

exports.handler = async (event, context) => {

  let statusCode = 200;
  /**
   *  Get all images in the bucket
   */
  const imageListParams = {
    FunctionName: 'getImageList',
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: ''
  }
  let imageList = await lambda.invoke(imageListParams).promise();
  imageList = JSON.parse(imageList.Payload).body;

  /**
   *  Categorize Images using AWS Rekogintion
   */
  let categorized = await doRekognition(imageList);


  /**
   *  Crop images using boundingBox
   */
  let cropped = await doCrop(categorized);
  cropped = await extractObject(cropped, 'Payload');

  /**
   *  Group images by emotion
   */
  let groupedImages = await groupBy(cropped, 'emotion');


  /**
   * Create collage per emotion
   */

  let collages = [];
  for(const [key,value] of Object.entries(groupedImages)) {
    collages.push(await doCreateCollage(value));
  }

  return '';
};




const doRekognition = async (images) => {

  let promises = [];
  let params = {
    FunctionName: 'categorizeImage',
    InvocationType: 'RequestResponse',
    LogType: 'Tail'
  }
  for(const i of images) {
    params['Payload'] = `{"image": "${i}"}`
    promises.push(await lambda.invoke(params).promise())
  }

  return promises;
}


const doCrop = async (images) => {

  let promises = [];
  const params = {
    FunctionName: 'cropImage',
    InvocationType: 'RequestResponse',
    LogType: 'Tail'
  }
  for(const i of images) {
    let image = JSON.parse(i.Payload).body
    image['key'] = image['image']
    if(image.image) {
      params['Payload'] = JSON.stringify(image)
      promises.push(await lambda.invoke(params).promise())
    }

  }
  return promises;

}


const doCreateCollage = async (images) => {
  let promises = [];
  const params = {
    FunctionName: 'createCollage',
    InvocationType: 'RequestResponse',
    LogType: 'Tail',
    Payload: JSON.stringify({images:images})
  }
  return await lambda.invoke(params).promise()

}




const groupBy = async (array, key) => {
  return array.reduce((hash, obj) => {
    if(obj[key] === undefined) return hash;
    return Object.assign(hash, { [obj[key]]:( hash[obj[key]] || [] ).concat(obj)})
  }, {})
}


const extractObject = async(array, key) => {
  const newArr = [];
  for(const i of array) {
    newArr.push(JSON.parse(i[key]))
  }
  return newArr;

}


