document.addEventListener('DOMContentLoaded', () => {
    const views = {
        loader: document.getElementById('app-loader'),
        activation: document.getElementById('activation-view'),
        login: document.getElementById('login-view'),
        panel: document.getElementById('admin-panel'),
    };
    const mainViews = {
        posts: document.getElementById('posts-view'),
        settings: document.getElementById('settings-view'),
    };
    const navButtons = {
        posts: document.getElementById('nav-posts'),
        settings: document.getElementById('nav-settings'),
    };
    const editorContainer = document.getElementById('editor-container');
    const postList = document.getElementById('post-list');

    let token = null, owner = '', repo = '';
    let posts = [], postsSha = '';
    let config = {}, configSha = '';

    const showView = (view) => Object.values(views).forEach(v => v.style.display = v === view ? 'block' : 'none');
    const showMainView = (view) => {
        Object.values(mainViews).forEach(v => v.style.display = 'none');
        Object.values(navButtons).forEach(b => b.classList.remove('active'));
        mainViews[view].style.display = 'block';
        navButtons[view].classList.add('active');
    };
    const setButtonsDisabled = (disabled) => document.querySelectorAll('button').forEach(b => b.disabled = disabled);

    const init = async () => {
        try {
            const res = await fetch('config.json?t=' + new Date().getTime());
            if (res.ok) {
                const configData = await res.json();
                owner = configData.repo.owner;
                repo = configData.repo.name;
                showView(views.login);
            } else {
                showView(views.activation);
            }
        } catch (error) {
            views.loader.innerHTML = '<h1>加载失败，请检查网络和控制台错误。</h1>';
        }
    };

    const login = async (userToken) => {
        token = userToken;
        setButtonsDisabled(true);
        try {
            await loadData();
            showView(views.panel);
            showMainView('posts');
            renderPostList();
            populateSettings();
        } catch (error) {
            alert(`登录失败: ${error.message}`);
            token = null;
        } finally {
            setButtonsDisabled(false);
        }
    };

    const loadData = async () => {
        const [postsData, configData] = await Promise.all([
            GitHubAPI.getFile(token, owner, repo, 'posts.json'),
            GitHubAPI.getFile(token, owner, repo, 'config.json')
        ]);
        posts = JSON.parse(postsData.content);
        postsSha = postsData.sha;
        config = JSON.parse(configData.content);
        configSha = configData.sha;
    };
    
    const renderPostList = () => {
        postList.innerHTML = '';
        [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(post => {
            const li = document.createElement('li');
            li.innerHTML = `${post.title}<span>${new Date(post.createdAt).toLocaleDateString()}</span>`;
            li.onclick = () => openEditor(post.id);
            postList.appendChild(li);
        });
    };

    const openEditor = (postId = null) => {
        editorContainer.style.display = 'block';
        const post = posts.find(p => p.id === postId);
        document.getElementById('post-id').value = post?.id || '';
        document.getElementById('post-title').value = post?.title || '';
        document.getElementById('post-content').value = post?.content || '';
        document.getElementById('post-tags').value = post?.tags?.join(', ') || '';
        document.getElementById('delete-post-btn').style.display = post ? 'inline-block' : 'none';
    };

    const savePost = async () => {
        const id = document.getElementById('post-id').value;
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        if (!title || !content) return alert('标题和内容不能为空！');
        
        setButtonsDisabled(true);
        const tags = document.getElementById('post-tags').value.split(',').map(t => t.trim()).filter(Boolean);
        const postIndex = posts.findIndex(p => p.id === id);

        if (postIndex > -1) {
            Object.assign(posts[postIndex], { title, content, tags, updatedAt: new Date().toISOString() });
        } else {
            posts.push({ id: `post_${Date.now()}`, title, content, tags, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
        }
        
        try {
            const res = await GitHubAPI.updateFile(token, owner, repo, 'posts.json', JSON.stringify(posts, null, 2), postsSha, 'docs: update posts');
            postsSha = res.content.sha;
            alert('保存成功！');
            renderPostList();
            editorContainer.style.display = 'none';
        } catch (error) {
            alert(`保存失败: ${error.message}`);
        } finally {
            setButtonsDisabled(false);
        }
    };

    const deletePost = async () => {
        const id = document.getElementById('post-id').value;
        if (!id || !confirm('确定要删除这篇文章吗？')) return;
        setButtonsDisabled(true);
        posts = posts.filter(p => p.id !== id);
        try {
            const res = await GitHubAPI.updateFile(token, owner, repo, 'posts.json', JSON.stringify(posts, null, 2), postsSha, 'docs: delete post');
            postsSha = res.content.sha;
            alert('删除成功！');
            renderPostList();
            editorContainer.style.display = 'none';
        } catch (error) {
            alert(`删除失败: ${error.message}`);
        } finally {
            setButtonsDisabled(false);
        }
    };
    
    const populateSettings = () => {
        document.getElementById('setting-title').value = config.site.title;
        document.getElementById('setting-description').value = config.site.description;
        document.getElementById('setting-bg-color').value = config.styling.backgroundColor;
        document.getElementById('setting-text-color').value = config.styling.textColor;
        document.getElementById('setting-accent-color').value = config.styling.accentColor;
        document.getElementById('setting-bg-image-url').value = config.styling.backgroundImageUrl;
    };
    
    const saveSettings = async () => {
        setButtonsDisabled(true);
        const newConfig = { ...config };
        newConfig.site.title = document.getElementById('setting-title').value.trim();
        newConfig.site.description = document.getElementById('setting-description').value.trim();
        newConfig.styling.backgroundColor = document.getElementById('setting-bg-color').value;
        newConfig.styling.textColor = document.getElementById('setting-text-color').value;
        newConfig.styling.accentColor = document.getElementById('setting-accent-color').value;
        newConfig.styling.backgroundImageUrl = document.getElementById('setting-bg-image-url').value;
        try {
            const res = await GitHubAPI.updateFile(token, owner, repo, 'config.json', JSON.stringify(newConfig, null, 2), configSha, 'docs: update config');
            configSha = res.content.sha;
            config = newConfig;
            alert('网站设置已保存！');
        } catch (error) {
            alert(`设置保存失败: ${error.message}`);
        } finally {
            setButtonsDisabled(false);
        }
    };
    
    const uploadFile = async (file, isBgImage = false) => {
        if (!file) return;
        setButtonsDisabled(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const content = e.target.result.split(',')[1];
            const path = `images/${new Date().toISOString().replace(/[-:.]/g, '')}_${file.name}`;
            try {
                const result = await GitHubAPI.createFile(token, owner, repo, path, content, 'feat: upload image', true);
                const url = result.content.download_url;
                if (isBgImage) {
                    document.getElementById('setting-bg-image-url').value = url;
                } else {
                    document.getElementById('post-content').value += `\n![${file.name}](${url})\n`;
                }
            } catch (error) {
                alert(`图片上传失败: ${error.message}`);
            } finally {
                setButtonsDisabled(false);
            }
        };
        reader.readAsDataURL(file);
    };

    document.getElementById('activate-btn').onclick = async () => {
        const userToken = document.getElementById('activate-token-input').value;
        if (!userToken) return alert('请输入Token');
        setButtonsDisabled(true);
        try {
            const user = await GitHubAPI.getUser(userToken);
            const pathSegments = window.location.pathname.split('/').filter(v => v);
            const repoName = pathSegments[1] || 'your-repo';
            const initialConfig = {
                repo: { owner: user.login, name: repoName },
                site: { title: `${user.login}'s Blog`, description: "A blog powered by a single repo." },
                styling: { backgroundColor: "#ffffff", textColor: "#333333", accentColor: "#007bff", backgroundImageUrl: "" }
            };
            await GitHubAPI.createFile(userToken, user.login, repoName, 'config.json', JSON.stringify(initialConfig, null, 2), 'feat: initialize config');
            await GitHubAPI.createFile(userToken, user.login, repoName, 'posts.json', '[]', 'feat: initialize posts');
            await GitHubAPI.createFile(userToken, user.login, repoName, 'images/.gitkeep', '', 'feat: initialize images directory');
            alert('系统激活成功！页面将自动刷新。');
            window.location.reload();
        } catch (error) {
            alert(`激活失败: ${error.message}`);
        } finally {
            setButtonsDisabled(false);
        }
    };
    
    navButtons.posts.onclick = () => showMainView('posts');
    navButtons.settings.onclick = () => showMainView('settings');
    document.getElementById('login-btn').onclick = () => login(document.getElementById('login-token-input').value);
    document.getElementById('new-post-btn').onclick = () => openEditor();
    document.getElementById('cancel-edit-btn').onclick = () => editorContainer.style.display = 'none';
    document.getElementById('save-post-btn').onclick = savePost;
    document.getElementById('delete-post-btn').onclick = deletePost;
    document.getElementById('save-settings-btn').onclick = saveSettings;
    document.getElementById('image-upload').onchange = (e) => uploadFile(e.target.files[0], false);
    document.getElementById('setting-bg-image').onchange = (e) => uploadFile(e.target.files[0], true);
    document.getElementById('clear-bg-image-btn').onclick = () => { document.getElementById('setting-bg-image-url').value = ''; };

    init();
});