import fs from 'fs';
import path from 'path';

export async function walkSync(
  currentDirPath: string,
  callback: (filePath: string, stat: fs.Stats) => void,
) {
  const promises = fs.readdirSync(currentDirPath).map(async function (name) {
    const filePath = path.join(currentDirPath, name);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      await callback(filePath, stat);
    } else if (stat.isDirectory()) {
      await walkSync(filePath, callback);
    }
  });
  await Promise.all(promises);
}
