const fs = require('fs');
const fsPromise = require('fs/promises');
const readline = require('readline');
const path = require('path');



async function createIndexHtml() {
  const templateFile = path.join(__dirname, 'template.html');
  const fd = await fsPromise.open(templateFile);
  const lineReader = readline.createInterface({input: await fd.createReadStream()});
  const indexHtml = path.join(__dirname, 'project-dist', 'index.html');

  let strTemplate = '';
  for await (const line of lineReader) {
    strTemplate += line + '\n';
  }

  const dirents = await fsPromise.readdir(path.join(__dirname, 'components'), {withFileTypes: true});
  const components = [];
  for (const dirent of dirents) {
    const fileInfo = path.parse(path.join(__dirname, 'components', dirent.name));
    if (dirent.isFile() && fileInfo.ext === '.html') {
      components.push(fileInfo.name);
    }
  }

  for (const componentName of components) {
    if (strTemplate.includes(`{{${componentName}}}`)) {
      let strForReplace = '';
      const fd = await fsPromise.open(path.join(__dirname, 'components', `${componentName}.html`));
      const lineReader = readline.createInterface({input: await fd.createReadStream()});
      for await (const line of lineReader) {
        strForReplace += line + '\n';
      }
      strTemplate = strTemplate.replace(`{{${componentName}}}`, strForReplace);
    }
  }

  await fsPromise.mkdir(path.join(__dirname, 'project-dist'), {recursive: true});
  await fsPromise.writeFile(indexHtml, strTemplate);
}

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

  const bundleFile = path.join(__dirname, 'project-dist', 'style.css');
  fs.writeFile(bundleFile, '', err => {
    if (err)
      throw err;

    const writable = fs.createWriteStream(bundleFile);

    streams.forEach(value => {
      value.pipe(writable);
    });
  });

};

const src = path.join(__dirname, 'assets');
const dest = path.join(__dirname, 'project-dist', 'assets');

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

async function start() {
  try {
    await createIndexHtml();
  } catch (err) {
    console.error(err);
  }

  await bundleCSS(stylesDir);
  await copyFiles(src, dest);
}

start();