const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const value = express();
const flag = { user: 'admin', pass: 'admin' };
const downloadtkn = new Map();

value.use(express.json());
value.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

value.post('/auth', (req, res) => {
  const run = req.body || {};
  if (run.user !== flag.user || run.pass !== flag.pass) {
    return res.status(401).json({ success: false, message: 'auth fail' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  downloadtkn.set(token, { requests: 0 });
  res.json({ success: true, message: 'auth success', download: `/download/${token}` });
});

value.get('/download/:token', (req, res) => {
  const token = req.params.token;
  const tkndata = downloadtkn.get(token);
  tkndata.requests++;
  downloadtkn.set(token, tkndata);
  
  const temp = path.join(__dirname, 'test.dll');
  if (!fs.existsSync(temp)) fs.writeFileSync(temp, Buffer.alloc(0));
  const result = fs.readFileSync(temp);
  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment; filename="test.dll"',
    'Content-Length': result.length
  });
  res.send(result);
  
  if (tkndata.requests >= 2) downloadtkn.delete(token);
});

value.get('/download', (req, res) => {
  const paths = [
    path.join(__dirname, '..', 'frontend', 'dist', 'kittyauth.exe'),
  ];
  const temp = paths.find((p) => fs.existsSync(p));
  if (!temp) return res.status(404).send('kittyauth.exe missing');
  const result = fs.readFileSync(temp);
  res.set({
    'Content-Type': 'application/octet-stream',
    'Content-Disposition': 'attachment; filename="kittyauth.exe"',
    'Content-Length': result.length
  });
  res.send(result);
});

value.get('/test', (req, res) => {
  const ping = Date.now();
  const pong = Date.now();
  res.json({ ping, pong });
});

value.listen(80, () => {
  const os = require('os');
  const interfaces = os.networkInterfaces();
  let serverIP = 'localhost';
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        serverIP = iface.address;
        break;
      }
    }
  }
  console.log(`http://${serverIP}/test`);
  console.log(`http://${serverIP}/download`);
});