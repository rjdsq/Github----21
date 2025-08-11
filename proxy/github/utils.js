// utils.js
// 工具函数（极简注释）
window.APP = window.APP || {};
const U = {
  fmtSize(bytes){
    if (!bytes && bytes !== 0) return '';
    const k = 1024, sizes = ['B','KB','MB','GB'];
    const i = Math.floor(Math.max(0, Math.log(bytes||1)/Math.log(k)));
    return parseFloat((bytes/Math.pow(k,i)).toFixed(2)) + ' ' + sizes[i];
  },
  relTime(dateStr){
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const diff = Date.now() - d;
    const m = Math.floor(diff/60000), h = Math.floor(m/60), day = Math.floor(h/24);
    if (m < 1) return '刚刚';
    if (m < 60) return m + '分钟前';
    if (h < 24) return h + '小时前';
    if (day < 30) return day + '天前';
    return d.toLocaleDateString();
  },
  escape(s){ return (s||'').toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); },
  domainOf(url){
    try { const u = new URL(url.startsWith('http')?url:`https://${url}`); return u.hostname; }
    catch(e){ return ''; }
  },
  base64FromArrayBuffer(buf){
    let binary = '';
    const bytes = new Uint8Array(buf);
    const len = bytes.byteLength;
    for (let i=0;i<len;i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }
};
APP.U = U;