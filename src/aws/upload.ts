import {
  GetObjectCommand,
  ListObjectsCommandInput,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { config } from 'dotenv';
import fs from 'fs';
import mime from 'mime';
import path from 'path';

import { walkSync } from '../utils';

config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
});

export const bucketParams: ListObjectsCommandInput = { Bucket: 'kunft-assets' };

const uploadDir = function (s3Path: string, bucketName: string) {
  walkSync(s3Path, async function (filePath: string) {
    const bucketPath = filePath.substring(s3Path.length + 1);
    const params: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: bucketPath.replaceAll('\\', '/'),
      ACL: 'public-read',
    };

    try {
      // Check if key is already exist
      await s3Client.send(new GetObjectCommand(params));
    } catch (error: any) {
      if (error.Code !== 'NoSuchKey') {
        console.error(error);
        return;
      }
      params.Body = fs.readFileSync(filePath);
      params.ContentType = mime.getType(filePath)
        ? mime.getType(filePath)!
        : undefined;

      // console.log('Uploading object: ' + params.Key);

      try {
        await s3Client.send(new PutObjectCommand(params));

        console.log(
          'Successfully uploaded object: ' + params.Bucket + '/' + params.Key,
        );
      } catch (error: any) {
        console.error(`Failed to upload ${params.Key}`);
      }
    }
  });
};

const uploadPath = path.resolve(__dirname, '../../../metadata');

uploadDir(uploadPath, process.env.AWS_BUCKET!);
