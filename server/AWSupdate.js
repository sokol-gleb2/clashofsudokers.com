import aws from 'aws-sdk';
import { accessKeyId_MAIN, accessKeyId_BACKUP, secretAccessKey_MAIN, secretAccessKey_BACKUP, region_MAIN, region_BACKUP, bucketName_MAIN, bucketName_BACKUP } from './config'

const S3 = aws.S3;
import fs from 'fs';




const s3 = new S3({
  accessKeyId: accessKeyId_MAIN,
  secretAccessKey: secretAccessKey_MAIN,
  region: region_MAIN
});

const s3_BACKUP = new S3({
  accessKeyId: accessKeyId_BACKUP,
  secretAccessKey: secretAccessKey_BACKUP,
  region: region_BACKUP
});

// export default async function updateImage(file, username) {
//     try {
//         // List objects in the bucket
//         s3.listObjects({Bucket: bucketName_MAIN}, (err, data) => {
//             if (err) console.log(err, err.stack); // an error occurred
//             else {
//                 const objects = data.Contents;
//                 // Assuming there's only one object in the bucket and it's the image to be replaced
//                 if(objects.length > 0) {
//                     const objectKey = objects[0].Key;

//                     // Delete the old image
//                     s3.deleteObject({Bucket: bucketName_MAIN, Key: objectKey}, (err, data) => {
//                         if (err) return { message: 'Upload unsuccessful', cause: "ERROR" }; // an error occurred
//                         else {
                            
//                             // Upload the new image
//                             const fileStream = fs.createReadStream(`${username}/${file.originalname}`);
//                             fileStream.on('error', function(err) {
//                                 return { message: 'Upload unsuccessful', cause: "ERROR" };
//                             });
                            
//                             const uploadParams = {
//                                 Bucket: bucketName_MAIN, 
//                                 Key: `${username}/${file.originalname}`, 
//                                 Body: fileStream
//                             };
//                             s3.upload(uploadParams, function(err, data) {
//                                 if (err) {
//                                     return { message: 'Upload unsuccessful', cause: "ERROR" };
//                                 } if (data) {
//                                     return { message: 'Upload successful', url: data.Location };
//                                 }
//                             });
//                         }
//                     });
//                 } else {
//                     return { message: 'Upload unsuccessful', cause: "NO_IMAGE_ERROR" };
//                 }
//             }
//         });
//     } catch (error) {
//         // return { message: 'Upload unsuccessful', cause: "ERROR" };
//         throw new Error(error.message);
//     }
// }


export default async function updateImage(file, username) {
    try {
        // List objects in both buckets
        const [dataMain, dataBackup] = await Promise.all([
            listObjects({ Bucket: bucketName_MAIN }),
            listObjects({ Bucket: bucketName_BACKUP }),
        ]);

        const objectsMain = dataMain.Contents;
        const objectsBackup = dataBackup.Contents;

        // Assuming there's only one object in each bucket and it's the image to be replaced
        if (objectsMain.length > 0 && objectsBackup.length > 0) {
            const objectKeyMain = objectsMain[0].Key;
            const objectKeyBackup = objectsBackup[0].Key;

            // Delete the old image in both buckets
            await Promise.all([
                s3.deleteObject({ Bucket: bucketName_MAIN, Key: objectKeyMain }),
                s3_BACKUP.deleteObject({ Bucket: bucketName_BACKUP, Key: objectKeyBackup }),
            ]);

            const fileStream = fs.createReadStream(`${username}/${file.originalname}`);
            fileStream.on('error', function(err) {
                return { message: 'Upload unsuccessful', cause: "ERROR" };
            });

            // Upload the new image to both buckets
            const uploadParamsMain = {
                Bucket: bucketName_MAIN,
                Key: `${username}/${file.originalname}`,
                Body: fileStream, // Assuming file.buffer is the buffer of the new image
            };

            const uploadParamsBackup = {
                Bucket: bucketName_BACKUP,
                Key: `${username}/${file.originalname}`,
                Body: fileStream,
            };

            const [uploadResultMain, uploadResultBackup] = await Promise.all([
                s3.upload(uploadParamsMain),
                s3_BACKUP.upload(uploadParamsBackup),
            ]);

            return { 
                message: 'Upload successful',
                url: uploadResultMain.Location
            };
        } else {
            return { message: 'No image found to update in one or both buckets.' };
        }
    } catch (error) {
        throw new Error(`Update unsuccessful: ${error.message}`);
    }
}
