import aws from 'aws-sdk';
import { accessKeyId_MAIN, secretAccessKey_MAIN, region_MAIN, bucketName_MAIN } from './config'

const S3 = aws.S3;


const s3 = new S3({
    accessKeyId: accessKeyId_MAIN,
    secretAccessKey: secretAccessKey_MAIN,
    region: region_MAIN
});

export default async function retrieveImage(username) {
    try {
        const data = await s3.listObjectsV2({
            Bucket: 'media.clashofsudokers.com',
            Prefix: username,
            MaxKeys: 1
        }).promise();

        if (data.Contents.length === 0) {
            return {error: 'No images found'};
        }

        const firstImageKey = data.Contents[0].Key;
        const url = s3.getSignedUrl('getObject', {
            Bucket: 'media.clashofsudokers.com',
            Key: firstImageKey,
            Expires: 86400 // URL expiry time in seconds
        });

        return {url : url}
    } catch (error) {
        throw new Error(error.message);
    }
}