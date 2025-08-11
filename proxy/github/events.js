// events.js
// 绑定事件（极简注释）
window.APP = window.APP || {};
(function(){
  // 基础元素
  const el = {
    authBtn: document.getElementById('authBtn'),
    tokenInput: document.getElementById('tokenInput'),
    uploadBtn: document.getElementById('uploadBtn'),
    fileUploadInput: document.getElementById('fileUploadInput'),
    saveEdit: document.getElementById('saveEdit'),
    closeEditModal: document.getElementById('closeEditModal')
  };

  if (el.authBtn) el.authBtn.onclick = ()=>{ APP.state.token = el.tokenInput.value.trim(); localStorage.setItem('gh_token', APP.state.token); APP.Repo.fetchRepos().catch(()=>APP.UI.showToast('登录或拉取仓库失败')); document.getElementById('authScreen').classList.add('hidden'); document.getElementById('app').classList.remove('hidden'); };

  if (el.uploadBtn) el.uploadBtn.onclick = ()=>{ el.fileUploadInput.click(); };
  if (el.fileUploadInput) el.fileUploadInput.addEventListener('change', (e)=>{
    const files = Array.from(e.target.files || []);
    if (files.length) APP.UploadMod.uploadFilesInSequence(files);
    e.target.value = '';
  });

  if (el.saveEdit) el.saveEdit.onclick = async ()=>{
    try {
      const content = document.getElementById('fileContent').value;
      const path = APP.state.editingFile;
      const sha = APP.state.fileSha;
      await APP.FileOps.saveEditedFile(path, content, sha);
      APP.UI.showToast('保存成功');
      document.getElementById('editModal').classList.add('hidden');
      APP.Repo.fetchFiles(true);
    } catch(e){
      APP.UI.showToast('保存失败: ' + (e.message||''));
    }
  };

  if (el.closeEditModal) el.closeEditModal.onclick = ()=>{ document.getElementById('editModal').classList.add('hidden'); };

  // 页面就绪后自动拉取仓库（若已有 token）
  document.addEventListener('DOMContentLoaded', ()=>{
    if (APP.state.token) {
      APP.Repo.fetchRepos().catch(()=>{ APP.UI.showToast('拉取仓库失败'); });
    }
  });

})();