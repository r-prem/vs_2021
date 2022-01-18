exports.handler = async (event) => {

  let {images, bucketOut} = event;
  let objArr = [];
  images.forEach(i => {
    objArr.push(JSON.parse(i))
  })
  let groupedImages;
  try {
    groupedImages = await groupBy(objArr, "emotion");
  }catch(e) {
    console.log(e)
  }
  let output = [];
  for(const [key,value] of Object.entries(groupedImages)) {
    output.push(JSON.stringify({[key]: value}))
  }
  return {
    groupedImages: output,
    bucketOut: bucketOut,
    length: Object.keys(groupedImages).length
  };
// [{angry: }]
};

const groupBy = async (array, key) => {
  return array.reduce((hash, obj) => {
    if(obj[key] === undefined) return hash;
    return Object.assign(hash, { [obj[key]]:( hash[obj[key]] || [] ).concat(obj)})
  }, {})
}
