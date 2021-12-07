module.exports = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Accounting Tools</title>
<style>
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
            await Promise.all(['kho', 'kt'].map(name => {
                return myFetch('/accounting/post/upload?uploadType=' + name, {
                  method: 'POST',
                  body: fileMap[name],
                })
            }));
            const res = await myFetch('/accounting/post/compare', {
                method: 'POST',
            })
            console.log(res);
        } catch (err){
            window.alert(err.message);
        }
    })

    updateInfo();
</script>
</body>
</html>
`;
