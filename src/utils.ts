import path from 'path';
import fs from 'fs';

export async function walkSync(
  currentDirPath: string,
  callback: (filePath: string, stat: fs.Stats) => void,
) {
  const promises = fs.readdirSync(currentDirPath).map(async function (name) {
    var filePath = path.join(currentDirPath, name);
    var stat = fs.statSync(filePath);
    if (stat.isFile()) {
      await callback(filePath, stat);
    } else if (stat.isDirectory()) {
      await walkSync(filePath, callback);
    }
  });
  await Promise.all(promises);
}
