const path = require('path');
const fsPromise = require('fs/promises');
const fs = require('fs');

const stylesDir = path.join(__dirname, 'styles');

const bundleCSS = async function(stylesDir) {
  const dirents = await fsPromise.readdir(stylesDir, {withFileTypes: true});
  const streams = [];

  for (const dirent of dirents) {
    if (dirent.isFile()) {
      const file = path.join(stylesDir, dirent.name);
      const fileParse = path.parse(file);
      if (fileParse.ext === '.css') {
        const fd = await fsPromise.open(file);
        const stream = await fd.createReadStream();
        streams.push(stream);
      }
    }
  }

  const bundleFile = path.join(__dirname, 'project-dist', 'bundle.css');
  fs.writeFile(bundleFile, '', async err => {
    if (err)
      throw err;

    const writable = fs.createWriteStream(bundleFile);

    for (const stream of streams) {
      for await (const chunk of stream) {
        writable.write(chunk);
      }
      writable.write('\n\n');
    }
  });

};

bundleCSS(stylesDir);