import aws from 'aws-sdk';
import { accessKeyId_MAIN, accessKeyId_BACKUP, secretAccessKey_MAIN, secretAccessKey_BACKUP, region_MAIN, region_BACKUP, bucketName_MAIN } from './config.js'

const S3 = aws.S3;


const s3 = new S3({
  accessKeyId: accessKeyId_MAIN,
  secretAccessKey: secretAccessKey_MAIN,
  region: region_MAIN
});

// const s3_BACKUP = new S3({
//   accessKeyId: accessKeyId_BACKUP,
//   secretAccessKey: secretAccessKey_BACKUP,
//   region: region_BACKUP
// });

export default async function uploadImage(file, username) {
    try {
        const uploadResult = await s3.upload({
            Bucket: bucketName_MAIN,
            Key: `${username}/${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype
        }).promise();
        
        // const uploadResult_BACKUP = await s3_BACKUP.upload({
        //     Bucket: bucketName_BACKUP,
        //     Key: `${username}/${file.originalname}`,
        //     Body: file.buffer,
        //     ContentType: file.mimetype
        // }).promise();
    
        return { message: 'Upload successful', url: uploadResult.Location };
    } catch (error) {
        throw new Error(error.message);
    }
}

// export default async function uploadImage(file, username) {
//     try {
//         const mainUploadPromise = s3.upload({
//             Bucket: bucketName_MAIN,
//             Key: `${username}/${file.originalname}`,
//             Body: file.buffer,
//             ContentType: file.mimetype
//         }).promise();

//         const backupUploadPromise = s3_BACKUP.upload({
//             Bucket: bucketName_BACKUP,
//             Key: `${username}/${file.originalname}`,
//             Body: file.buffer,
//             ContentType: file.mimetype
//         }).promise();

//         const [uploadResult, uploadResult_BACKUP] = await Promise.all([mainUploadPromise, backupUploadPromise]);
        
//         return { message: 'Upload successful', url: uploadResult.Location };
//     } catch (error) {
//         throw new Error(error.message);
//     }
// }
