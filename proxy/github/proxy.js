// proxy.js
// 代理管理（添加/测试/保存/全局切换）极简注释
window.APP = window.APP || {};
const ProxyMod = (function(state, API, U){
  async function testProxy(proxyUrl){
    const url = proxyUrl.trim();
    if (!url) throw new Error('空地址');
    const testTarget = 'https://raw.githubusercontent.com/octocat/Hello-World/master/README'; // 小文件路径
    // 构造可能的 proxied 地址（两种策略）
    const candidates = [
      url.endsWith('/') ? url + testTarget : url + '/' + testTarget,
      // 替域名替换策略（如果 user 给的是域）：直接替换 raw.githubusercontent.com
      testTarget.replace(/^https?:\/\/raw\.githubusercontent\.com/,'https://' + U.domainOf(url))
    ];
    let best = { status: 'fail', type: null, latency: null, err: null };
    for (const c of candidates){
      const t0 = Date.now();
      try {
        const r = await fetch(c, { method: 'GET', cache: 'no-store' });
        const latency = Date.now() - t0;
        if (r.ok) {
          // 简单判定类型
          const t = c.indexOf(testTarget) !== -1 && c.startsWith(url) ? 'prefix' : 'raw_domain_replace';
          best = { status: 'ok', type: t, latency, err: null, url };
          break;
        } else {
          best.err = `HTTP ${r.status}`;
        }
      } catch (e) {
        best.err = e.message;
      }
    }
    return best;
  }

  function addProxy(proxy){
    state.proxies.push(proxy);
    persist();
  }
  function updateProxy(i, proxy){
    state.proxies[i] = proxy;
    persist();
  }
  function removeProxy(i){
    state.proxies.splice(i,1);
    if (state.activeProxyIndex >= state.proxies.length) state.activeProxyIndex = state.proxies.length-1;
    persist();
  }
  function setActive(i){
    state.activeProxyIndex = i;
    localStorage.setItem('active_proxy_index', String(state.activeProxyIndex));
  }
  function toggleGlobal(v){
    state.proxyGlobalEnable = typeof v === 'boolean' ? v : !state.proxyGlobalEnable;
    localStorage.setItem('proxy_global_enable', JSON.stringify(state.proxyGlobalEnable));
  }
  function persist(){ localStorage.setItem('proxies', JSON.stringify(state.proxies)); }

  return { testProxy, addProxy, updateProxy, removeProxy, setActive, toggleGlobal, persist };
})(APP.state, APP.API, APP.U);

APP.ProxyMod = ProxyMod;