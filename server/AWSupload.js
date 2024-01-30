import aws from 'aws-sdk';

const S3 = aws.S3;


const s3 = new S3({
  accessKeyId: 'AKIA4VUBUDEPP2VPIQKN',
  secretAccessKey: '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',
  region: 'eu-west-2'
});

export default async function uploadImage(file, username) {
    try {
        const uploadResult = await s3.upload({
            Bucket: 'media.clashofsudokers.com',
            Key: `${username}/${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype
        }).promise();
    
        return { message: 'Upload successful', url: uploadResult.Location };
    } catch (error) {
        throw new Error(error.message);
    }
}