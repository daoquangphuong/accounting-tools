const XLSX = require('xlsx');
const check = require('../models/check');

async function readXlSX(stream) {
  return new Promise((resolve, reject) => {
    const buffers = [];
    stream.on('data', data => {
      buffers.push(data);
    });
    stream.on('end', () => {
      const buffer = Buffer.concat(buffers);
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      resolve(workbook);
    });
    stream.on('error', err => {
      reject(err);
    });
  });
}

module.exports = async function upload(req, res, next) {
  try {
    const workbook = await readXlSX(req);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    check.fileMap[req.query.uploadType] = jsonData;
    next(true);
  } catch (e) {
    next(e);
  }
};
