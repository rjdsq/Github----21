// ui.js
// 渲染与交互最小化（极简注释）
window.APP = window.APP || {};
const UI = (function(state, U){
  // 简单的 el 缓存
  const E = {
    repoList: document.getElementById('repoList'),
    fileList: document.getElementById('fileList'),
    pathNav: document.getElementById('pathNav'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    uploadPanel: document.getElementById('uploadPanel'),
    uploadItems: document.getElementById('uploadItems')
  };

  function showToast(msg, time=2500){
    if (!E.toast) return;
    E.toast.classList.remove('hidden');
    E.toastMessage.textContent = msg;
    clearTimeout(E._toastTid);
    E._toastTid = setTimeout(()=>{ E.toast.classList.add('hidden'); }, time);
  }

  function renderRepoList(){
    if (!E.repoList) return;
    E.repoList.innerHTML = '';
    if (!state.repos || state.repos.length===0) {
      E.repoList.innerHTML = `<div class="empty-state"><i class="fa fa-list"></i><p>无仓库</p></div>`;
      return;
    }
    state.repos.forEach(r=>{
      const d = document.createElement('div');
      d.className = 'file-item';
      d.innerHTML = `<div class="file-info"><div class="file-name">${U.escape(r.name)}</div><div class="file-meta">${U.escape(r.desc||'')}</div></div>`;
      d.onclick = ()=>{ state.currentRepo = r.name; APP.Repo.fetchFiles(true); toggleToFileView(); };
      E.repoList.appendChild(d);
    });
  }

  function applyFiltersAndRender(){
    // 与原 applyFiltersAndSort 一致，但放 UI 内以便直接渲染
    let arr = Array.isArray(state.files) ? [...state.files] : [];
    const q = (state.searchQuery||'').toLowerCase();
    if (q) arr = arr.filter(f => (f.name||'').toLowerCase().includes(q));
    const by = state.sortBy;
    const sorters = {
      name_asc: (a,b)=> a.type===b.type ? a.name.localeCompare(b.name) : a.type==='dir' ? -1 : 1,
      name_desc: (a,b)=> a.type===b.type ? b.name.localeCompare(a.name) : a.type==='dir' ? -1 : 1,
      time_desc: (a,b)=> { const ta = a.last_modified?+new Date(a.last_modified):0; const tb = b.last_modified?+new Date(b.last_modified):0; if (a.type!==b.type) return a.type==='dir'? -1:1; return tb-ta; },
      time_asc: (a,b)=> { const ta = a.last_modified?+new Date(a.last_modified):0; const tb = b.last_modified?+new Date(b.last_modified):0; if (a.type!==b.type) return a.type==='dir'? -1:1; return ta-tb; },
      size_desc: (a,b)=> { if (a.type!==b.type) return a.type==='dir'? -1:1; return (b.size||0)-(a.size||0); },
      size_asc: (a,b)=> { if (a.type!==b.type) return a.type==='dir'? -1:1; return (a.size||0)-(b.size||0); }
    };
    (sorters[by]||sorters.name_asc) && arr.sort(sorters[by]);
    state.displayFiles = arr;
    renderFileList();
  }

  function renderFileList(){
    if (!E.fileList) return;
    E.fileList.innerHTML = '';
    if (!state.displayFiles || state.displayFiles.length===0) {
      E.fileList.innerHTML = `<div class="empty-state"><i class="fa fa-folder-open"></i><p>该目录为空</p></div>`;
      return;
    }
    state.displayFiles.forEach(f=>{
      const it = document.createElement('div');
      it.className = 'file-item';
      const icon = getFileIcon(f.name || '');
      it.innerHTML = `<div class="file-icon"><i class="fa ${icon}"></i></div>
                      <div class="file-info">
                        <div class="file-name">${U.escape(f.name)}</div>
                        <div class="file-meta">${f.type==='dir'?'文件夹':'文件'} ${f.size?U.fmtSize(f.size):''} ${f.last_modified?U.relTime(f.last_modified):''}</div>
                      </div>`;
      it.onclick = ()=>{ handleFileClick(f); };
      E.fileList.appendChild(it);
    });
  }

  function getFileIcon(name){
    const ext = (name.split('.').pop()||'').toLowerCase();
    const map = { js:'fa-code', html:'fa-html5', css:'fa-css3', png:'fa-file-image-o', jpg:'fa-file-image-o', md:'fa-file-text-o', zip:'fa-file-zip-o', mp3:'fa-music', mp4:'fa-film' };
    return map[ext]||'fa-file-o';
  }

  // 上传面板相关
  function showUploadPanel(files){
    if (!E.uploadPanel || !E.uploadItems) return;
    E.uploadPanel.classList.remove('hidden');
    E.uploadItems.innerHTML = '';
    files.forEach((f,i)=>{
      const name = f.name.length>25 ? f.name.slice(0,22)+'.' : f.name;
      const node = document.createElement('div');
      node.className = 'upload-item';
      node.innerHTML = `<div class="upload-info"><span class="upload-name" title="${U.escape(f.name)}">${U.escape(name)}</span><span class="upload-size">${U.fmtSize(f.size)}</span></div>
                        <div class="upload-progress-container"><div class="upload-progress" data-index="${i}"><span class="percent-text" data-index="${i}">0%</span></div></div>
                        <div class="upload-status" data-index="${i}">等待上传</div>`;
      E.uploadItems.appendChild(node);
    });
  }
  function updateUploadItem(index, {status, percent, message}){
    const bar = document.querySelector(`.upload-progress[data-index="${index}"]`);
    const percentEl = bar ? bar.querySelector(`.percent-text[data-index="${index}"]`) : null;
    const st = document.querySelector(`.upload-status[data-index="${index}"]`);
    if (percentEl && typeof percent === 'number') percentEl.textContent = `${percent}%`;
    if (bar && typeof percent === 'number') bar.style.width = `${percent}%`;
    if (st) {
      st.textContent = message || (status === 'success' ? '上传成功' : status === 'error' ? '上传失败' : st.textContent);
      st.className = 'upload-status ' + (status === 'success' ? 'success' : status === 'error' ? 'error' : '');
    }
  }
  function hideUploadPanel(){ if (E.uploadPanel) E.uploadPanel.classList.add('hidden'); }

  // 文件点击处理（简化：文件打开/进入）
  function handleFileClick(f){
    if (f.type === 'dir') {
      state.currentPath = f.path.endsWith('/') ? f.path : f.path + '/';
      Repo.fetchFiles(true);
      return;
    }
    // 读取文件并打开编辑（简化）
    openFileEditor(f);
  }

  async function openFileEditor(f){
    try {
      const [owner, repo] = state.currentRepo.split('/');
      const r = await APP.API.ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents/${f.path}`, { method: 'GET' });
      if (!r.ok) throw new Error('读取失败');
      const data = await r.json();
      const content = data.content ? atob(data.content.replace(/\n/g,'')) : '';
      // 填充编辑器 DOM（使用原页面 ID）
      document.getElementById('fileContent').value = content;
      document.getElementById('editFileName').textContent = f.name;
      APP.state.editingFile = f.path;
      APP.state.fileSha = data.sha;
      document.getElementById('editModal').classList.remove('hidden');
    } catch(e){
      showToast('打开失败: ' + (e.message||''));
    }
  }

  // 暴露
  return { showToast, renderRepoList, applyFiltersAndRender, renderFileList, showUploadPanel, updateUploadItem, hideUploadPanel, handleFileClick, getFileIcon, openFileEditor };
})(APP.state, APP.U);

