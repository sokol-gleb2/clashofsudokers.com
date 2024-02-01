import aws from 'aws-sdk';

const S3 = aws.S3;


const s3 = new S3({
  accessKeyId: 'AKIA4VUBUDEPP2VPIQKN',
  secretAccessKey: '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',
  region: 'eu-west-2'
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