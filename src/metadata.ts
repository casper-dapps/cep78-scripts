import path from 'path';
import fs from 'fs';
import { walkSync } from './utils';
import { config } from 'dotenv';
config();

const AWS_BUCKET = process.env.AWS_BUCKET;

const imageUrlTemplate = `https://${AWS_BUCKET}.s3.amazonaws.com/`;

export const updateImageUrls = async (metadataPath: string) => {
  walkSync(metadataPath, async function (filePath, stat) {
    // Serve only json files
    if (!filePath.endsWith('json')) return;

    const bucketPath = filePath
      .substring(metadataPath.length + 1)
      .replaceAll('\\', '/')
      .replace(' ', '+')
      .replace('/metadata', '/output')
      .replace('.json', '.png');
    const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    content.image = `${imageUrlTemplate}${bucketPath}`;
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
  });
};

const metadataPath = path.resolve(__dirname, '../../metadata');

updateImageUrls(metadataPath);
