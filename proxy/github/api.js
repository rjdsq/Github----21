// api.js
// GitHub API 封装 + 代理入口（极简注释）
window.APP = window.APP || {};
const API = (function(state, U){
  async function ghFetch(url, opts = {}) {
    // 自动注入 token、代理处理
    opts.headers = opts.headers || {};
    if (state.token) opts.headers['Authorization'] = `token ${state.token}`;
    opts.headers['User-Agent'] = opts.headers['User-Agent'] || 'Mozilla/5.0';
    // 代理转换
    const finalUrl = proxiedUrl(url);
    // 默认超时支持（使用 AbortSignal.timeout 如果可用）
    const controller = new AbortController();
    const timeout = opts.timeout || 15000;
    const timeoutId = setTimeout(()=>controller.abort(), timeout);
    opts.signal = controller.signal;
    try {
      const r = await fetch(finalUrl, opts);
      clearTimeout(timeoutId);
      return r;
    } catch(e){
      clearTimeout(timeoutId);
      throw e;
    }
  }

  function proxiedUrl(orig){
    if (!state.proxyGlobalEnable || !Array.isArray(state.proxies) || state.proxies.length===0) return orig;
    const idx = state.activeProxyIndex;
    if (typeof idx !== 'number' || idx<0 || idx>=state.proxies.length) return orig;
    const p = state.proxies[idx];
    if (!p || !p.url || p.status === 'fail' || !p.type) return orig;
    // 仅代理 raw.githubusercontent 内容
    if (!orig.startsWith('https://raw.githubusercontent.com/')) return orig;
    const proxyUrl = (p.url || '').trim();
    if (p.type === 'prefix') {
      return proxyUrl.endsWith('/') ? proxyUrl + orig : proxyUrl + '/' + orig;
    }
    if (p.type === 'raw_domain_replace') {
      const domain = U.domainOf(proxyUrl);
      if (!domain) return orig;
      return orig.replace(/^https?:\/\/raw\.githubusercontent\.com/,'https://'+domain);
    }
    return orig;
  }

  return { ghFetch, proxiedUrl };
})(APP.state, APP.U);

APP.API = API;