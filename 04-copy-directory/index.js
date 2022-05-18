const path = require('path');
const fsPromise = require('fs/promises');

const src = path.join(__dirname, 'files');
const dest = path.join(__dirname, 'files-copy');

const copyFiles = async function(src, dest) {
  await fsPromise.mkdir(dest, {recursive: true});
  await fsPromise.rmdir(dest, { recursive: true });
  await fsPromise.mkdir(dest, {recursive: true});

  const dirents = await fsPromise.readdir(src,{encoding: 'utf8', withFileTypes: true});
  for (const dirent of dirents) {
    if (dirent.isFile()) {
      await fsPromise.copyFile(path.join(src, dirent.name), path.join(dest, dirent.name));
    } else if (dirent.isDirectory()) {
      await copyFiles(path.join(src, dirent.name), path.join(dest, dirent.name));
    }
  }
};

copyFiles(src, dest);