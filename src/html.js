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

/* The container */
.container {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 22px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
}

/* On mouse-over, add a grey background color */
.container:hover input ~ .checkmark {
  background-color: #ccc;
}

/* When the checkbox is checked, add a blue background */
.container input:checked ~ .checkmark {
  background-color: #2196F3;
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

</style>
</head>
<body>
<div class="app">
    <div class="info">
        <div>
            <input id="upload" style="display: none" type="file" accept=".xls, .xlsx"/>
            <button id="btn-kho" class="btn">Nhập Exel Kho</button>
            <button id="btn-kt" class="btn">Nhập Exel Kế Toán</button>
        </div>
        <br/>
        <div>
            <div>
                <label class="container">Convert FONT cho Kho
                    <input id="kho-font" type="checkbox">
                    <span class="checkmark"></span>
                </label>
                <label class="container">Convert FONT cho Kế Toán
                    <input id="kt-font" type="checkbox">
                    <span class="checkmark"></span>
                </label>
            </div>
        </div>
        <div>
            <button id="btn-check-qc" class="btn">So sánh theo quy cách</button>
            <button id="btn-check-name" class="btn">So sánh theo tên</button>
        </div>
    </div>
    <br>
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
</div>
<script>
    const $upload = document.getElementById('upload');
    const $btnKho = document.getElementById('btn-kho');
    const $btnKt = document.getElementById('btn-kt');
    const $btnCheckQc = document.getElementById('btn-check-qc');
    const $btnCheckName = document.getElementById('btn-check-name');

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
        $btnCheckQc.disabled = !(fileMap.kho && fileMap.kt);
        $btnCheckName.disabled = !(fileMap.kho && fileMap.kt);
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

    const handleCheck = async (type = 'qc') => {
        try{
            const $khoMissing = document.getElementById('kho-missing');
            const $ktMissing = document.getElementById('kt-missing');
            const $wrong = document.getElementById('wrong');

            $khoMissing.innerHTML = '';
            $ktMissing.innerHTML = '';
            $wrong.innerHTML = '';

            await Promise.all(['kho', 'kt'].map(name => {
                return myFetch('/accounting/post/upload?uploadType=' + name, {
                  method: 'POST',
                  body: fileMap[name],
                })
            }));

            const $khoFont = document.getElementById('kho-font');
            const $ktFont = document.getElementById('kt-font');

            const query = [
                'compareType='+type,
                 $khoFont.checked ? 'khoFont=true' : '',
                  $ktFont.checked ? 'ktFont=true' : ''
            ].filter(Boolean).join('&')

            const res = await myFetch('/accounting/post/compare?' + query, {
                method: 'POST',
            })
            const {khoMissingTable, ktMissingTable, wrongTable} = res;
            $khoMissing.innerHTML = khoMissingTable;
            $ktMissing.innerHTML = ktMissingTable;
            $wrong.innerHTML = wrongTable;
        } catch (err){
            window.alert(err.message);
        }
    }

    $btnCheckQc.addEventListener('click', () => {
        handleCheck('qc')
    })

    $btnCheckName.addEventListener('click', () => {
        handleCheck('name')
    })

    updateInfo();
</script>
</body>
</html>
`;
