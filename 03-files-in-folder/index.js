const fsPromise = require('fs/promises');
const path = require('path');

const secretFolder = path.join(__dirname, 'secret-folder');

const readInfoAboutFiles = async function (folder) {
  try {
    const dirents = await fsPromise.readdir(folder,{encoding: 'utf8', withFileTypes: true});
    for (const dirent of dirents) {
      const fileName = path.join(folder, dirent.name);
      if (dirent.isFile()) {
        const stats = await fsPromise.stat(fileName);
        const fileInfo = path.parse(fileName);
        console.log(`${fileInfo.name} - ${fileInfo.ext.substring(1)} - ${Math.floor(stats.size / 1024 * 100) / 100}Kb`);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

readInfoAboutFiles(secretFolder);