// fileOps.js
// 文件操作（创建/重命名/删除/编辑保存）极简注释
window.APP = window.APP || {};
const FileOps = (function(state, API, U){
  async function createFile(name, content=''){
    if (!state.currentRepo) throw new Error('未选仓库');
    const [owner, repo] = state.currentRepo.split('/');
    const path = state.currentPath ? `${state.currentPath}${name}` : name;
    const body = { message: `create ${name}`, content: btoa(unescape(encodeURIComponent(content))) };
    const r = await API.ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error('创建失败');
    return await r.json();
  }

  async function saveEditedFile(path, newContent, prevSha){
    if (!state.currentRepo) throw new Error('未选仓库');
    const [owner, repo] = state.currentRepo.split('/');
    const encoded = btoa(unescape(encodeURIComponent(newContent)));
    const body = { message: `edit ${path}`, content: encoded, sha: prevSha };
    const r = await API.ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      const err = await r.json().catch(()=>({message:`HTTP ${r.status}`}));
      throw new Error(err.message || '保存失败');
    }
    return await r.json();
  }

  async function deletePath(path, sha){
    if (!state.currentRepo) throw new Error('未选仓库');
    const [owner, repo] = state.currentRepo.split('/');
    const body = { message: `delete ${path}`, sha };
    const r = await API.ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!r.ok) {
      const err = await r.text().catch(()=>`HTTP ${r.status}`);
      throw new Error(err || '删除失败');
    }
    return true;
  }

  async function renamePath(oldPath, newPath, sha){
    // GitHub 没有直接重命名接口：实现为新建（带 content）+删除旧文件
    if (!state.currentRepo) throw new Error('未选仓库');
    // 读取原文件内容
    const [owner, repo] = state.currentRepo.split('/');
    const r = await API.ghFetch(`https://api.github.com/repos/${owner}/${repo}/contents/${oldPath}`, { method: 'GET' });
    if (!r.ok) throw new Error('读取原文件失败');
    const data = await r.json();
    const content = data.content ? atob(data.content.replace(/\n/g,'')) : '';
    // 创建新文件
    await createFile(newPath, content);
    // 删除旧文件
    await deletePath(oldPath, data.sha);
    return true;
  }

  return { createFile, saveEditedFile, deletePath, renamePath };
})(APP.state, APP.API, APP.U);

APP.FileOps = FileOps;