const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

function ask(text) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(`${text} (yes/no): `, (answer) => {
      rl.close();
      resolve(/^y(es)?$/i.test(answer.trim()));
    });
  });
}

(async () => {
  if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
    execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  }
  if (await ask('Build UI')) {
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'frontend') });
    execSync('npm run build:win', { stdio: 'inherit', cwd: './frontend' });
  }
  if (await ask('Start backend')) {
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'backend') });
    execSync('netsh advfirewall firewall add rule name="KittyAuth" dir=in action=allow protocol=TCP localport=80', { stdio: 'ignore' });
    require('./backend/server');
  }
})();
