const fs = require('fs');
const path = require('path');
const process = require('process');
const readline = require('readline');

fs.writeFile(path.resolve(__dirname, 'text.txt'), '', (err) => {
  if (err) {
    throw err;
  }
  recursiveReadline();
});

const rl = readline.createInterface({input: process.stdin, output: process.stdout});

const recursiveReadline = function () {
  rl.question('Text something: ', (answer) => {
    if (answer == 'exit') {
      closeRL(rl);
      return;
    }
    fs.appendFile(path.resolve(__dirname, 'text.txt'), `${answer}\n`, (err) => {
      if(err)
        throw err;
      recursiveReadline();
    });
  });
};

rl.on('SIGINT', () => {
  closeRL(rl);
});

function closeRL(rl) {
  console.log('Thank you!!!');
  rl.close();
}





