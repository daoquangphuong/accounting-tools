const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');
const fileMap = require('./fileMap');

const headers = [
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
];

const readFile = async filePath => {
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  return workbook.SheetNames.map(sheetName => {
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
      raw: false,
      header: headers,
    });
    return {
      fileName: path.basename(filePath),
      name: sheetName.trim(),
      data: jsonData,
    };
  });
};

const readData = async () => {
  const files = fs
    .readdirSync(path.resolve(__dirname, 'sample-dh'))
    .filter(i => i.match(/\.xlsx$/))
    // .filter(i => i === '16-11-2023-VERDE-15.xlsx')
    .slice(0);

  const data = await Promise.all(
    files.map(async filePath => {
      return readFile(path.resolve(__dirname, 'sample-dh', filePath));
    })
  );

  fileMap.dh = data;
};

const parseData = workbook => {
  return workbook
    .map(sheet => {
      try {
        const typeMatch = sheet.name.match(/(SƠN|ĐÍNH KÈM|ĐÓNG GÓI)/i);
        if (!typeMatch) {
          // console.info('New Sheet:', sheet.name);
          return null;
        }
        const rowContainValueHeader = sheet.data.find(row =>
          headers.find(
            header =>
              row[header] &&
              row[header].toLowerCase().match(/Tổng\s*SL\s*\/\s*KL/i)
          )
        );
        const valueHeader = headers.find(
          header =>
            rowContainValueHeader[header] &&
            rowContainValueHeader[header]
              .toLowerCase()
              .match(/Tổng\s*SL\s*\/\s*KL/i)
        );
        const type = typeMatch['1'].toUpperCase();

        if (!valueHeader) {
          throw new Error('Not found VALUE header');
        }

        switch (type) {
          case 'SƠN': {
            return sheet.data
              .map(row => {
                const STT =
                  row.__EMPTY === undefined ||
                  row.__EMPTY === null ||
                  row.__EMPTY === false
                    ? NaN
                    : parseInt(row.__EMPTY.toString().trim(), 10);
                if (Number.isNaN(STT)) {
                  return null;
                }
                const item = {
                  TYPE: type,
                  NAME: sheet.name,
                  FILENAME: sheet.fileName,
                  STT: (row.__EMPTY || '').trim(),
                  TVT: (row.__EMPTY_1 || '').trim(),
                  MVT: (row.__EMPTY_2 || '').trim(),
                  QC: '',
                  VALUE: (row[valueHeader] || '').trim(),
                };
                item.KEY = item.TVT || item.MVT;
                return item;
              })
              .filter(Boolean);
          }
          case 'ĐÍNH KÈM': {
            return sheet.data
              .map(row => {
                const STT =
                  row.__EMPTY === undefined ||
                  row.__EMPTY === null ||
                  row.__EMPTY === false
                    ? NaN
                    : parseInt(row.__EMPTY.toString().trim(), 10);
                if (Number.isNaN(STT)) {
                  return null;
                }
                const item = {
                  TYPE: type,
                  NAME: sheet.name,
                  FILENAME: sheet.fileName,
                  STT: (row.__EMPTY || '').trim(),
                  MVT: (row.__EMPTY_1 || '').trim(),
                  TVT: (row.__EMPTY_2 || '').trim(),
                  QC: '',
                  VALUE: (row[valueHeader] || '').trim(),
                };
                item.KEY = item.TVT || item.MVT;
                return item;
              })
              .filter(Boolean);
          }
          case 'ĐÓNG GÓI': {
            return sheet.data
              .map(row => {
                const STT =
                  row.__EMPTY === undefined ||
                  row.__EMPTY === null ||
                  row.__EMPTY === false
                    ? NaN
                    : parseInt(row.__EMPTY.toString().trim(), 10);
                if (Number.isNaN(STT)) {
                  return null;
                }
                const item = {
                  TYPE: type,
                  NAME: sheet.name,
                  FILENAME: sheet.fileName,
                  STT: (row.__EMPTY || '').trim(),
                  MVT: (row.__EMPTY_1 || '').trim(),
                  TVT: (row.__EMPTY_2 || '').trim(),
                  QC: (row.__EMPTY_3 || '').trim(),
                  VALUE: (row[valueHeader] || '').trim(),
                };
                return item;
              })
              .filter(Boolean);
          }
          default:
            break;
        }
        return true;
      } catch (e) {
        throw new Error(`[${sheet.fileName}][${sheet.name}]: ${e.message}`);
      }
    })
    .filter(Boolean);
};

const renderTable = (data, { showWrong = false, headerNameMap = {} } = {}) => {
  if (!data.length) {
    return `<div>NO DATA</div>`;
  }

  const wrongMap = {};

  const headerMap = data.reduce((map, item) => {
    Object.keys(item).forEach(k => {
      map[k] = true;
    });
    return map;
  }, {});

  const header = Object.keys(headerMap);
  header.sort((a, b) => {
    return (
      Object.keys(headerNameMap).indexOf(a) -
      Object.keys(headerNameMap).indexOf(b)
    );
  });

  const headerNames = header.map(i => headerNameMap[i] || i);

  return `
<table>
    <tr>
        ${headerNames.map(i => `<th>${i}</th>`).join('\n')}
    </tr>
    ${data
      .map(d => {
        wrongMap[d.key] = wrongMap[d.key] || d;
        const preRow = wrongMap[d.key];
        return `<tr>${header
          .map(i => {
            const isWrongValue = (preRow[i] || `0`) !== (d[i] || `0`);
            return `<td ${
              showWrong && showWrong[i] && isWrongValue
                ? `style="color: red"`
                : ''
            }>${d[i] === undefined ? '' : d[i]}</td>`;
          })
          .join('\n')}</tr>`;
      })
      .join('\n')}
</table>
  `;
};

const analytic = async () => {
  const workbooks = fileMap.dh;
  if (!workbooks) {
    throw new Error('Not found workbooks');
  }
  const data = workbooks.map(workbook => parseData(workbook));
  const map = {};
  const errorTable = [];
  data.forEach(dayData => {
    dayData.forEach(items => {
      items.forEach(item => {
        if (!item.TVT && !item.MVT && !item.QC) {
          return;
        }
        const keys = [item.TYPE];
        switch (item.TYPE) {
          case 'SƠN': {
            keys.push(item.TVT || item.MVT);
            break;
          }
          case 'ĐÍNH KÈM': {
            keys.push(item.TVT || item.MVT);
            break;
          }
          case 'ĐÓNG GÓI': {
            if (item.TVT || item.QC) {
              keys.push(item.TVT, item.QC);
            } else {
              keys.push(item.MVT);
            }
            break;
          }
          default: {
            break;
          }
        }
        const key = keys.map(i => i.toLowerCase().replace(/\s/g, '')).join('');
        map[key] = map[key] || {
          key,
          TYPE: item.TYPE,
          TVT: item.TVT,
          MVT: item.MVT,
          QC: item.QC,
          _total: 0,
          successItems: [],
          errorItems: [],
        };
        try {
          const value = Math.floor(item.VALUE.replace(/,/g, '') * 1000);
          if (!value) {
            throw new Error('Not found Value');
          }
          map[key]._total += value;
          map[key].total = (map[key]._total / 1000).toString();
          map[key].successItems.push(item);
        } catch (e) {
          item.ERROR = `<div title="${e.stack}">${e.message}</div>`;
          item.FILENAME = `<div title="${key}">${item.FILENAME}</div>`;
          map[key].errorItems.push(item);
          errorTable.push(item);
        }
      });
    });
  });

  const sonTable = [];
  const dinhKemTable = [];
  const dongGoiTable = [];

  Object.values(map).forEach(item => {
    switch (item.TYPE) {
      case 'SƠN': {
        sonTable.push(item);
        break;
      }
      case 'ĐÍNH KÈM': {
        dinhKemTable.push(item);
        break;
      }
      case 'ĐÓNG GÓI': {
        dongGoiTable.push(item);
        break;
      }
      default: {
        break;
      }
    }
  });

  const normalizeTable = tableData => {
    tableData.sort((a, b) => a.key.localeCompare(b.key));
    return tableData
      .filter(i => i.total)
      .map(i => {
        return {
          TVT: i.TVT,
          MVT: i.MVT,
          QC: i.QC,
          total: `<div title="${i.successItems
            .map(
              child =>
                `${[child.TVT, child.MVT, child.QC]
                  .filter(Boolean)
                  .join(' ')} = ${child.VALUE}`
            )
            .join('\n')}">${i.total}</div>`,
        };
      });
  };

  return {
    sonTable: renderTable(normalizeTable(sonTable), {
      headerNameMap: {
        TVT: 'Tên Vật Tư',
        MVT: 'Mã Vật Tư',
        QC: 'Quy Cách',
        total: 'Xuất',
      },
    }),
    dinhKemTable: renderTable(normalizeTable(dinhKemTable), {
      headerNameMap: {
        TVT: 'Tên Vật Tư',
        MVT: 'Mã Vật Tư',
        QC: 'Quy Cách',
        total: 'Xuất',
      },
    }),
    dongGoiTable: renderTable(normalizeTable(dongGoiTable), {
      headerNameMap: {
        TVT: 'Tên Vật Tư',
        MVT: 'Mã Vật Tư',
        QC: 'Quy Cách',
        total: 'Xuất',
      },
    }),
    errorTable: renderTable(errorTable, {
      headerNameMap: {
        FILENAME: 'File Exel',
        NAME: 'Sheet Name',
        TYPE: 'Loại Đơn Hàng',
        STT: 'STT',
        TVT: 'Tên Vật Tư',
        MVT: 'Mã Vật Tư',
        QC: 'Quy Cách',
        VALUE: 'Xuất',
        ERROR: 'Thông Tin Lỗi',
      },
    }),
  };
};

// readData()
//   .then(analytic)
//   .catch(console.error);

module.exports = {
  readData,
  analytic,
};
