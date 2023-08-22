import { S3 } from 'aws-sdk';

const s3BucketName = 'atto-web';

const awsConfig = {
  region: 'ap-northeast-2',
  accessKeyId: 'AKIAYEP6Q2QFZ77BR345',
  secretKeyId: 'sSkoOcaYGUEBdoqmX1kCF8sMphigGNDrf/8/wSTg',
};

const S3Client = new S3(awsConfig);

type S3File = {
  Key: string;
};

export const deleteS3File = (fileList: S3File[]) => {
  const params = {
    Bucket: s3BucketName,
    Delete: {
      Objects: fileList,
      Quiet: false,
    },
  };
  return new Promise((resolve, reject) => {
    S3Client.deleteObjects(params, function (err, data) {
      if (err) {
        console.error(err);
        reject(err);
      }
      // an error occurred
      else resolve(data); // successful response
    });
  });
};
