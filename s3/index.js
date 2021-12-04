import { ListObjectsV2Command } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";



const config = {
    REGION: "us-east-1",
    BUCKET: "testbucketvs21",
    apiVersion: '2006-03-01',
}

const REGION = config.REGION;
const s3Client = new S3Client({region: REGION, apiVersion: config.apiVersion});


const run = async () => {
    try{
        const params = {Bucket: config.BUCKET, Delimiter: '/'}
        const images = await s3Client.send(
            new ListObjectsV2Command(params, function(err, data) {
                if (err) {
                    console.error(err);
                    return;
                } else {
                     console.log(data);
                     console.log("empty");   
                }
            })
        );
        if(images.Contents) {
            console.log(images.Contents)
        }
    }catch(e) {
        console.error(e);
    }

}
run();
