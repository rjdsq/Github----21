document.addEventListener('DOMContentLoaded', () => {
    const appLoader = document.getElementById('app-loader');
    const loaderMessage = document.getElementById('loader-message');
    const activationView = document.getElementById('activation-view');
    const loginView = document.getElementById('login-view');
    const adminPanel = document.getElementById('admin-panel');
    const editorContainer = document.getElementById('editor-container');
    const postList = document.getElementById('post-list');

    let token = null;
    let owner = '';
    let repo = '';
    let posts = [];
    let postsSha = '';

    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(v => v);
    owner = pathSegments[0] || 'your-username';
    repo = pathSegments[1] || 'your-repo';

    const showView = (view) => {
        [appLoader, activationView, loginView, adminPanel].forEach(v => v.style.display = 'none');
        view.style.display = 'block';
    };

    const init = async () => {
        try {
            const response = await fetch('config.json');
            if (response.status === 404) {
                showView(activationView);
            } else {
                showView(loginView);
            }
        } catch (error) {
            loaderMessage.textContent = '加载失败，请检查网络连接或GitHub Pages配置。';
        }
    };
    
    const login = async (userToken) => {
        token = userToken;
        try {
            await loadData();
            showView(adminPanel);
            renderPostList();
        } catch (error) {
            alert('登录失败！Token无效或仓库无法访问。');
            token = null;
        }
    };
    
    const loadData = async () => {
        const postsData = await GitHubAPI.getFileContent(token, owner, repo, 'posts.json');
        if (postsData) {
            posts = JSON.parse(postsData.content);
            postsSha = postsData.sha;
        }
    };
    
    const renderPostList = () => {
        postList.innerHTML = '';
        const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        sortedPosts.forEach(post => {
            const li = document.createElement('li');
            li.textContent = post.title;
            li.dataset.id = post.id;
            const dateSpan = document.createElement('span');
            dateSpan.textContent = new Date(post.createdAt).toLocaleDateString();
            li.appendChild(dateSpan);
            li.onclick = () => openEditor(post.id);
            postList.appendChild(li);
        });
    };

    const openEditor = (postId = null) => {
        editorContainer.style.display = 'block';
        const post = posts.find(p => p.id === postId);
        document.getElementById('post-id').value = post ? post.id : '';
        document.getElementById('post-title').value = post ? post.title : '';
        document.getElementById('post-content').value = post ? post.content : '';
        document.getElementById('post-tags').value = post ? post.tags.join(', ') : '';
        document.getElementById('delete-post-btn').style.display = post ? 'inline-block' : 'none';
    };
    
    const closeEditor = () => {
        editorContainer.style.display = 'none';
    };
    
    const savePost = async () => {
        const id = document.getElementById('post-id').value;
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const tags = document.getElementById('post-tags').value.split(',').map(t => t.trim()).filter(Boolean);
        
        if (!title.trim() || !content.trim()) {
            alert('标题和内容不能为空！');
            return;
        }

        const postIndex = posts.findIndex(p => p.id === id);
        if (postIndex > -1) {
            posts[postIndex] = { ...posts[postIndex], title, content, tags, updatedAt: new Date().toISOString() };
        } else {
            posts.push({ id: `post_${Date.now()}`, title, content, tags, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        }
        
        try {
            await GitHubAPI.updateFile(token, owner, repo, 'posts.json', JSON.stringify(posts, null, 2), postsSha, 'docs: update posts');
            alert('保存成功！');
            await loadData();
            renderPostList();
            closeEditor();
        } catch (error) {
            alert('保存失败，请检查Token权限或网络。');
        }
    };
    
    const deletePost = async () => {
        const id = document.getElementById('post-id').value;
        if (!id || !confirm('确定要删除这篇文章吗？')) return;

        posts = posts.filter(p => p.id !== id);
        
        try {
            await GitHubAPI.updateFile(token, owner, repo, 'posts.json', JSON.stringify(posts, null, 2), postsSha, 'docs: delete post');
            alert('删除成功！');
            await loadData();
            renderPostList();
            closeEditor();
        } catch (error) {
            alert('删除失败！');
        }
    };
    
    const uploadImage = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result.split(',')[1];
            const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
            const path = `images/${timestamp}_${file.name}`;
            
            try {
                const result = await GitHubAPI.createFile(token, owner, repo, path, content, 'feat: upload image');
                const url = result.content.download_url;
                const markdownLink = `![${file.name}](${url})`;
                const contentTextarea = document.getElementById('post-content');
                contentTextarea.value += `\n${markdownLink}\n`;
            } catch (error) {
                alert('图片上传失败！');
            }
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    };

    document.getElementById('activate-btn').onclick = async () => {
        const userToken = document.getElementById('activate-token-input').value;
        if (!userToken) { alert('请输入Token'); return; }
        
        try {
            const initialConfig = { title: `${owner}'s Blog`, description: 'A blog powered by a single repo.' };
            await GitHubAPI.createFile(userToken, owner, repo, 'config.json', JSON.stringify(initialConfig, null, 2), 'feat: initialize config');
            await GitHubAPI.createFile(userToken, owner, repo, 'posts.json', '[]', 'feat: initialize posts');
            await GitHubAPI.createFile(userToken, owner, repo, 'images/.gitkeep', '', 'feat: initialize images directory');
            alert('系统激活成功！页面将自动刷新。');
            window.location.reload();
        } catch (error) {
            alert(`激活失败: ${error.message}`);
        }
    };
    
    document.getElementById('login-btn').onclick = () => {
        const userToken = document.getElementById('login-token-input').value;
        if (!userToken) { alert('请输入Token'); return; }
        login(userToken);
    };

    document.getElementById('save-post-btn').onclick = savePost;
    document.getElementById('delete-post-btn').onclick = deletePost;
    document.getElementById('cancel-edit-btn').onclick = closeEditor;
    document.getElementById('new-post-btn').onclick = () => openEditor();
    document.getElementById('image-upload').onchange = uploadImage;

    init();
});