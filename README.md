<!DOCTYPE html>
<html lang="zh-CN">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>基于GitHub的静态网页项目</title>
  <style>
    /* 全局样式 */
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }

    h1,
    h2,
    h3 {
      color: #111;
    }

    a {
      color: #007bff;
      text-decoration: none;
    }

    a:hover {
      text-decoration: underline;
    }

    /* 标题样式 */
    .title {
      background-color: #f8f9fa;
      padding: 2rem;
      text-align: center;
    }

    .title h1 {
      margin: 0;
      font-size: 2.5rem;
      color: #343a40;
    }

    /* 功能亮点列表样式 */
    .features {
      padding: 2rem;
    }

    .features h2 {
      border-left: 4px solid #007bff;
      padding-left: 0.5rem;
    }

    .features ul {
      list-style-type: none;
      padding: 0;
    }

    .features ul li {
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
    }

    .features ul li::before {
      content: "✅";
      color: #28a745;
      margin-right: 0.5rem;
    }

    /* 演示地址部分样式 */
    .demo {
      background-color: #f8f9fa;
      padding: 2rem;
    }

    .demo h2 {
      margin-top: 0;
    }

    .demo table {
      border-collapse: collapse;
      width: 100%;
    }

    .demo table td,
    .demo table th {
      border: 1px solid #dee2e6;
      padding: 0.5rem;
      text-align: left;
    }

    .demo table th {
      background-color: #e9ecef;
    }
  </style>
</head>

<body>
  <!-- 标题部分 -->
  <div class="title">
    <h1>一个基于GitHub简洁高效的静态网页 | 让开发更优雅</h1>
  </div>

  <!-- 功能亮点部分 -->
  <div class="features">
    <h2>🚀 功能亮点</h2>
    <ul>
      <li>✅ <strong>开箱即用</strong> - 零配置快速启动</li>
      <li>⚡ <strong>超高性能</strong> - 基于 github + vue.js构建</li>
      <li>🔌 <strong>插件生态</strong> - 模块化扩展设计</li>
      <li>📱 <strong>响应式布局</strong> - 完美适配移动设备</li>
    </ul>
  </div>

  <!-- 演示地址部分 -->
  <div class="demo">
    <h2>🌐 演示地址</h2>
    <table>
      <thead>
        <tr>
          <th>名称</th>
          <th>地址</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Netlify</td>
          <td><a href="https://rjdsq.netlify.app/">https://rjdsq.netlify.app/</a></td>
        </tr>
      </tbody>
    </table>
  </div>
</body>

</html>
