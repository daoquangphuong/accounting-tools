module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Accounting Tools</title>
<style>
table {
    font-family: Arial, Helvetica, sans-serif;
    border-collapse: collapse;
    width: 100%;
    background: white;
}

table td, #table th {
  border: 1px solid #ddd;
  padding: 8px;
}

table tr:nth-child(even){background-color: #f2f2f2;}

table tr:hover {background-color: #ddd;}

table th {
  padding-top: 12px;
  padding-bottom: 12px;
  text-align: center;
  background-color: #4CAF50;
  color: white;
}

tr td:first-child {
  word-break: break-all;
}

.app {
    padding: 50px 20px;
    text-align: center;
}

.btn {
    cursor: pointer;
    padding: 15px 30px;
}

.info {
    text-align: left;
    width: 700px;
    margin: 10px auto;
    border: 1px solid black;
    padding: 20px;
}
</style>
</head>
<body>
<div class="app">
    <input id="upload" style="display: none" type="file" accept=".xls, .xlsx"/>
    <button id="btn-kho" class="btn">Nhập Exel Kho</button>
    <button id="btn-kt" class="btn">Nhập Exel Kế Toán</button>
    <button id="btn-check" class="btn">Hiển Thị Kết Quả</button>

    <div class="info">
        <div>Kho: <span id="kho-file-name"></span></div>
        <div>Kế Toán: <span id="kt-file-name"></span></div>
    </div>

    <h3>Kế Toán có mà Kho thiếu</h3>
    <div id="kho-missing">

    </div>

    <h3>Kho có mà Kế Toán thiếu</h3>
    <div id="kt-missing">

    </div>

    <h3>Sai Giá Trị</h3>
    <div id="wrong">

    </div>

    <h3>Đúng Giá Trị</h3>
    <div id="right">

    </div>
</div>
<script>
    const $upload = document.getElementById('upload');
    const $btnKho = document.getElementById('btn-kho');
    const $btnKt = document.getElementById('btn-kt');
    const $btnCheck = document.getElementById('btn-check');

    const fileMap = new Object({
        kho: null,
        kt: null,
    });
    let uploadType;

    const updateInfo = () => {
        const $khoName = document.getElementById('kho-file-name');
        const $ktName = document.getElementById('kt-file-name');
        if(fileMap.kho){
            $khoName.textContent = fileMap.kho.name;
        }
         if(fileMap.kt){
            $ktName.textContent = fileMap.kt.name;
        }
        $btnCheck.disabled = !(fileMap.kho && fileMap.kt);
    }

    $upload.addEventListener('change', (event) => {
      const { files } = event.target;
      if (!files || !files.length) {
        return;
      }
      const fileList = Array.from(files);
      const file = fileList[0];
      fileMap[uploadType] = file;
      event.target.value = '';
      updateInfo();
    })

    $btnKho.addEventListener('click', () => {
        uploadType = 'kho';
        $upload.click();
    })

    $btnKt.addEventListener('click', () => {
        uploadType = 'kt';
        $upload.click();
    })

    const myFetch = async (url, opts) => {
        const res = await fetch(url, opts);
        const jsonData = await res.json();
        if(!jsonData){
            throw new Error('Not found jsonData');
        }
        if(!jsonData.success){
            throw new Error(jsonData.error);
        }
        return jsonData.data;
    }

    $btnCheck.addEventListener('click', async () => {
        try{
            const $khoMissing = document.getElementById('kho-missing');
            const $ktMissing = document.getElementById('kt-missing');
            const $wrong = document.getElementById('wrong');
            const $right = document.getElementById('right');

            $khoMissing.innerHTML = '';
            $ktMissing.innerHTML = '';
            $wrong.innerHTML = '';
            $right.innerHTML = '';

            await Promise.all(['kho', 'kt'].map(name => {
                return myFetch('/accounting/post/upload?uploadType=' + name, {
                  method: 'POST',
                  body: fileMap[name],
                })
            }));
            const res = await myFetch('/accounting/post/compare', {
                method: 'POST',
            })
            const {khoMissingTable, ktMissingTable, wrongTable, rightTable} = res;
            $khoMissing.innerHTML = khoMissingTable;
            $ktMissing.innerHTML = ktMissingTable;
            $wrong.innerHTML = wrongTable;
            $right.innerHTML = rightTable;
        } catch (err){
            window.alert(err.message);
        }
    })

    updateInfo();
</script>
</body>
</html>
`;
