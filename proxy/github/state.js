// state.js
// 全局状态（极简注释）
window.APP = window.APP || {};
APP.state = {
  token: localStorage.getItem('gh_token') || null,
  currentRepo: null,
  currentPath: '',
  files: [],
  displayFiles: [],
  repos: [],
  selectedFile: null,
  uploadQueue: [],
  editingFile: null,
  fileSha: '',
  proxies: JSON.parse(localStorage.getItem('proxies') || '[{"url":"https://gh-proxy.com/","latency":null,"status":null,"type":null}]'),
  activeProxyIndex: parseInt(localStorage.getItem('active_proxy_index') || '0', 10),
  proxyGlobalEnable: JSON.parse(localStorage.getItem('proxy_global_enable') || 'true'),
  navHistory: ['root'],
  fileCache: new Map(),
  viewMode: localStorage.getItem('view_mode') || 'list',
  sortBy: localStorage.getItem('sort_by') || 'name_asc',
  searchQuery: ''
};