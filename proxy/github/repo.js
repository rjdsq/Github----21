// repo.js
// 仓库 / 文件列表拉取与缓存（极简注释）
window.APP = window.APP || {};
const Repo = (function(state, API, U){
  async function fetchRepos(){
    const r = await API.ghFetch('https://api.github.com/user/repos?per_page=200', { method: 'GET', timeout: 20000 });
    if (!r.ok) throw new Error('拉取仓库失败');
    const arr = await r.json();
    state.repos = arr.map(x => ({ name: x.full_name, desc: x.description }));
    APP.UI.renderRepoList();
    return state.repos;
  }

  async function fetchFiles(forceRefresh=false){
    if (!state.currentRepo) return;
    const cacheKey = `${state.currentRepo}:${state.currentPath}`;
    if (!forceRefresh && state.fileCache.has(cacheKey)){
      state.files = state.fileCache.get(cacheKey);
      APP.UI.applyFiltersAndRender();
      // 背景刷新
      setTimeout(()=>fetchFilesFromNetwork(cacheKey).catch(()=>{}), 1200);
      return;
    }
    return await fetchFilesFromNetwork(cacheKey);
  }

  async function fetchFilesFromNetwork(cacheKey){
    APP.UI.showFileLoading();
    try {
      const res = await API.ghFetch(`https://api.github.com/repos/${state.currentRepo}/contents/${state.currentPath}`, { method: 'GET', timeout: 20000, cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 404) { state.files = []; APP.UI.applyFiltersAndRender(); return; }
        throw new Error('加载文件失败');
      }
      const data = await res.json();
      state.files = Array.isArray(data) ? data : [];
      // 尝试附加 last_modified
      await Promise.all(state.files.map(async file=>{
        try {
          const [owner, repo] = state.currentRepo.split('/');
          const r = await API.ghFetch(`https://api.github.com/repos/${owner}/${repo}/commits?path=${file.path}&per_page=1`, { method: 'GET', timeout: 15000 });
          if (r.ok){
            const c = await r.json();
            if (Array.isArray(c) && c.length) file.last_modified = c[0].commit.committer.date;
          }
        } catch(e){}
      }));
      state.fileCache.set(cacheKey, JSON.parse(JSON.stringify(state.files)));
      APP.UI.applyFiltersAndRender();
    } catch(e){
      APP.UI.showToast('加载文件失败: ' + (e.message || ''));
    }
  }

  return { fetchRepos, fetchFiles, fetchFilesFromNetwork };
})(APP.state, APP.API, APP.U);

APP.Repo = Repo;