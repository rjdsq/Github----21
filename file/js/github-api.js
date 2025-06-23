// 配置数组：包含所有文本文件的链接和对应的元素ID
const textConfigs = [
    { fileUri: 'https://raw.kkgithub.com/rjdsq/rjdsq.github.io/main/选项卡1.txt', elementId: 'text1' },
    { fileUri: 'https://raw.kkgithub.com/rjdsq/rjdsq.github.io/main/选项卡2.txt', elementId: 'text2' },
    { fileUri: 'https://raw.kkgithub.com/rjdsq/rjdsq.github.io/main/选项卡3.txt', elementId: 'text3' }
];

// 处理文本格式，仅将换行符转换为<br>
function processText(text) {
    return text
        // 统一所有换行符为\n
        .replace(/\r\n|\r|\u2028|\u2029/g, '\n')
        // 将换行符转换为<br>
        .replace(/\n/g, '<br>');
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', () => {
    // 处理每个文本配置
    textConfigs.forEach(({ fileUri, elementId }) => {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // 在开始加载前显示加载提示
        element.innerHTML = "正在加载...";
        
        fetch(fileUri)
            .then(response => response.ok ? response.text() : Promise.reject('文件获取失败'))
            .then(text => { element.innerHTML = processText(text); })
            .catch(error => { element.innerHTML = `获取文件失败: ${error}`; });
    });
});

// 加载GitHub图片
document.addEventListener('DOMContentLoaded', function() {
    const message = document.getElementById('message');
    if (!message) return;

    message.innerHTML = "正在加载图片...";

    fetch('https://api.kkgithub.com/repos/rjdsq/rjdsq.github.io/contents/img/yunnan/')
        .then(response => response.json())
        .then(data => {
            message.innerHTML = '';
            data.forEach(item => {
                if (item.type === 'file' && /\.(jpg|jpeg|png|gif|svg)$/i.test(item.name)) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'image-container';
                    
                    const img = document.createElement('img');
                    // 核心修改：替换域名前缀
                    const kkgithubUrl = item.download_url.replace('https://raw.githubusercontent.com', 'https://raw.kkgithub.com');
                    img.src = kkgithubUrl;
                    img.alt = item.name;
                    img.loading = 'lazy';
                    img.className = 'landscape-image';
                    
                    const fileName = document.createElement('div');
                    fileName.className = 'wjm subtitle';
                    fileName.textContent = item.name.replace(/\.\w+$/, '');
                    
                    imgContainer.appendChild(img);
                    imgContainer.appendChild(fileName);
                    message.appendChild(imgContainer);
                }
            });
            
            if (message.children.length === 0) {
                message.innerHTML = '<p>没有找到图片</p>';
            }
        })
        .catch(error => {
            console.error('Error fetching images:', error);
            message.innerHTML = '<p>无法加载图片，请稍后再试。</p>';
        });
});
