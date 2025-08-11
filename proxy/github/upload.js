// upload.js
// 上传管理（队列、顺序上传、单文件上传）极简注释
window.APP = window.APP || {};
const UploadMod = (function(state, API, U){
  const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100MB

  async function uploadFilesInSequence(files = []){
    if (!files || files.length === 0) return;
    APP.UI.showUploadPanel(files);
    for (let i = 0; i < files.length; i++){
      const f = files[i];
      try {
        await uploadSingleFile(f, i);
        APP.UI.updateUploadItem(i, { status: 'success', percent: 100 });
      } catch(e){
        APP.UI.updateUploadItem(i, { status: 'error', message: e.message || '上传失败' });
      }
    }
    setTimeout(()=>{ APP.UI.hideUploadPanel(); APP.Repo.fetchFiles(true); }, 1200);
  }

  async function uploadSingleFile(file, index){
    if (file.size > MAX_FILE_BYTES) throw new Error('超过100MB');
    const arrBuf = await file.arrayBuffer();
    const base64 = U.base64FromArrayBuffer(arrBuf);
    if (!state.currentRepo) throw new Error('未选仓库');
    const fileName = file.name;
    const path = state.currentPath ? `${state.currentPath}${fileName}` : fileName;
    const [owner, repo] = state.currentRepo.split('/');
    // 检查是否存在以获取 sha
    let existingSha = null;
    try {
      const resCheck = await API.ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { method: 'GET' , timeout: 20000});
      if (resCheck.ok){
        const data = await resCheck.json();
        existingSha = data.sha;
      } else if (resCheck.status !== 404){
        // 非404错误，继续但记录
        console.warn('检查文件状态返回', resCheck.status);
      }
    } catch(e){
      console.warn('检查文件失败', e.message);
    }

    const body = { message: `Upload ${fileName}`, content: base64 };
    if (existingSha) body.sha = existingSha;
    const r = await API.ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      timeout: 180000
    });
    if (!r.ok) {
      let j = {};
      try { j = await r.json(); } catch(e){}
      throw new Error(j.message || `HTTP ${r.status}`);
    }
    return true;
  }

  return { uploadFilesInSequence, uploadSingleFile };
})(APP.state, APP.API, APP.U);

APP.UploadMod = UploadMod;