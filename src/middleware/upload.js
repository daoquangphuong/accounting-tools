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
    if (req.query.newSession) {
      switch (req.query.app) {
        case '1': {
          check.fileMap.kho = null;
          check.fileMap.kt = null;
          break;
        }
        case '2': {
          check.fileMap.dh = null;
          break;
        }
        default: {
          throw new Error('Not found APP');
        }
      }
      next(true);
      return;
    }
    const workbook = await readXlSX(req);
    switch (req.query.app) {
      case '1': {
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        check.fileMap[req.query.uploadType] = jsonData;
        break;
      }
      case '2': {
        check.fileMap.dh = check.fileMap.dh || [];
        const sheetList = workbook.SheetNames.map(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            raw: false,
            header: [
              '__EMPTY',
              '__EMPTY_1',
              '__EMPTY_2',
              '__EMPTY_3',
              '__EMPTY_4',
              '__EMPTY_5',
              '__EMPTY_6',
              '__EMPTY_7',
              '__EMPTY_8',
              '__EMPTY_9',
            ],
          });
          return {
            fileName: req.query.fileName,
            name: sheetName.trim(),
            data: jsonData,
          };
        });
        check.fileMap.dh.push(sheetList);
        break;
      }
      default: {
        throw new Error('Not found APP');
      }
    }
    next(true);
  } catch (e) {
    next(e);
  }
};
