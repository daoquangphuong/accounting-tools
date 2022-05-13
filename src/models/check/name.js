const font = require('../font');
const fileMap = require('./fileMap');

const normalizeKho = data => {
  return data
    .map(i => {
      Object.keys(i).forEach(key => {
        i[key] =
          i[key] && i[key].trim ? font.tcvn3ToUnicode(i[key]).trim() : i[key];
        const newKey = font.tcvn3ToUnicode(key).trim();
        const value = i[key];
        delete i[key];
        i[newKey] = value;
      });
      return i;
    })
    .map(i => ({
      t: i.t || 0,
      td: i.td === '-' ? 0 : i.td || 0,
      n: i.n === '-' ? 0 : i.n || 0,
      x: i.x === '-' ? 0 : i.x || 0,
      tc: i.tc === '-' ? 0 : i.tc || 0,
      full: i,
    }))
    .map(i => {
      return {
        ...i,
        key: i.t.toLowerCase(),
      };
    });
};

const normalizeKt = data => {
  return data
    .map(i => {
      Object.keys(i).forEach(key => {
        i[key] =
          i[key] && i[key].trim ? font.tcvn3ToUnicode(i[key]).trim() : i[key];
        const newKey = font.tcvn3ToUnicode(key).trim();
        const value = i[key];
        delete i[key];
        i[newKey] = value;
      });
      return i;
    })
    .map(i => ({
      t: i.t || '',
      td: i.td === '-' ? 0 : i.td || 0,
      n: i.n === '-' ? 0 : i.n || 0,
      x: i.x === '-' ? 0 : i.x || 0,
      tc: i.tc === '-' ? 0 : i.tc || 0,
      full: i,
    }))
    .map(i => {
      return {
        ...i,
        key: i.t.toLowerCase(),
      };
    });
};

const groupByKey = data => {
  return data.reduce((map, item) => {
    if (!map[item.key]) {
      map[item.key] = {
        key: item.key,
        td: item.td,
        n: item.n,
        x: item.x,
        tc: item.tc,
        items: [item],
      };
    } else {
      map[item.key].td += item.td;
      map[item.key].n += item.n;
      map[item.key].x += item.x;
      map[item.key].tc += item.tc;
      map[item.key].items.push(item);
    }
    return map;
  }, {});
};

const renderTable = data => {
  if (!data.length) {
    return `<div>NO DATA</div>`;
  }

  const headerMap = data.reduce((map, item) => {
    Object.keys(item).forEach(k => {
      map[k] = true;
    });
    return map;
  }, {});

  const header = Object.keys(headerMap);

  return `
<table>
    <tr>
        ${header.map(i => `<th>${i}</th>`).join('\n')}
    </tr>
    ${data
      .map(
        d =>
          `<tr>${header
            .map(i => `<td>${d[i] === undefined ? '' : d[i]}</td>`)
            .join('\n')}</tr>`
      )
      .join('\n')}
</table>
  `;
};

const compare = async () => {
  if (!fileMap.kho) {
    throw new Error('Not found Kho Data');
  }
  if (!fileMap.kt) {
    throw new Error('Not found Kt Data');
  }
  const kho = normalizeKho(fileMap.kho);
  const inKho = kho.filter(i => i.td || i.n || i.x || i.tc);
  // const outKho = kho.filter(i => !(i.td || i.n || i.x || i.tc));
  const kt = normalizeKt(fileMap.kt);
  const inKt = kt.filter(i => i.td || i.n || i.x || i.tc);
  // const outKt = kt.filter(i => !(i.td || i.n || i.x || i.tc));
  const khoMap = groupByKey(inKho);
  const ktMap = groupByKey(inKt);

  const wrongMap = {};
  const rightMap = {};

  const khoMissing = Object.entries(ktMap)
    .filter(([k, v]) => {
      const item = khoMap[k];
      if (!item) {
        return true;
      }

      const hasWrong = ['td', 'n', 'x', 'tc'].some(n => item[n] !== v[n]);

      if (hasWrong && !wrongMap[k]) {
        wrongMap[k] = {
          kho: item,
          kt: v,
        };
      } else {
        rightMap[k] = {
          kho: item,
          kt: v,
        };
      }

      return false;
    })
    .map(([, v]) => v);

  const ktMissing = Object.entries(khoMap)
    .filter(([k, v]) => {
      const item = ktMap[k];
      if (!item) {
        return true;
      }

      const hasWrong = ['td', 'n', 'x', 'tc'].some(n => item[n] !== v[n]);

      if (hasWrong && !wrongMap[k]) {
        wrongMap[k] = {
          kho: v,
          kt: item,
        };
      } else {
        rightMap[k] = {
          kho: v,
          kt: item,
        };
      }

      return false;
    })
    .map(([, v]) => v);

  const wrongTable = Object.entries(wrongMap).reduce((arr, [key, value]) => {
    arr.push(...value.kt.items.map(i => ({ key, from: 'ke toan', ...i.full })));
    arr.push(...value.kho.items.map(i => ({ key, from: 'kho', ...i.full })));
    return arr;
  }, []);

  const rightTable = Object.entries(rightMap).reduce((arr, [key, value]) => {
    arr.push(...value.kt.items.map(i => ({ key, from: 'ke toan', ...i.full })));
    arr.push(...value.kho.items.map(i => ({ key, from: 'kho', ...i.full })));
    return arr;
  }, []);

  // console.log(Object.keys(khoMap).length, Object.keys(ktMap).length);
  // console.log(khoMissing.length, ktMissing.length);
  // console.log(wrong.length);

  const khoMissingTable = khoMissing.reduce((arr, item) => {
    arr.push(...item.items.map(i => i.full));
    return arr;
  }, []);

  const ktMissingTable = ktMissing.reduce((arr, item) => {
    arr.push(...item.items.map(i => i.full));
    return arr;
  }, []);

  return {
    khoMissingTable: renderTable(khoMissingTable),
    ktMissingTable: renderTable(ktMissingTable),
    wrongTable: renderTable(wrongTable),
    rightTable: renderTable(rightTable),
  };
};

module.exports = {
  fileMap,
  compare,
};
