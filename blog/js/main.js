document.addEventListener('DOMContentLoaded', async () => {
    const converter = new showdown.Converter();
    const body = document.body;
    const blogTitleEl = document.getElementById('blog-title');
    const blogDescriptionEl = document.getElementById('blog-description');
    const postsContainer = document.getElementById('posts-container');

    try {
        const configRes = await fetch('config.json');
        if (!configRes.ok) throw new Error('博客未初始化');
        const config = await configRes.json();

        document.title = config.site.title;
        blogTitleEl.textContent = config.site.title;
        blogDescriptionEl.textContent = config.site.description;

        const { backgroundColor, textColor, accentColor, backgroundImageUrl } = config.styling;
        const root = document.documentElement;
        root.style.setProperty('--bg-color', backgroundColor);
        root.style.setProperty('--text-color', textColor);
        root.style.setProperty('--accent-color', accentColor);
        if (backgroundImageUrl) {
            body.style.backgroundImage = `url(${backgroundImageUrl})`;
        } else {
            body.style.backgroundImage = 'none';
        }

        const postsRes = await fetch('posts.json');
        if (!postsRes.ok) throw new Error('无法加载文章');
        const posts = await postsRes.json();

        postsContainer.innerHTML = '';
        if (posts.length > 0) {
            posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            posts.forEach(post => {
                const postEl = document.createElement('article');
                postEl.className = 'post';
                postEl.innerHTML = `
                    <h2 class="post-title">${post.title}</h2>
                    <p class="post-meta">发布于 ${new Date(post.createdAt).toLocaleDateString()}</p>
                    <div class="post-content">${converter.makeHtml(post.content)}</div>
                `;
                postsContainer.appendChild(postEl);
            });
        } else {
            postsContainer.innerHTML = '<p>暂无文章。</p>';
        }
    } catch (error) {
        blogTitleEl.textContent = '错误';
        postsContainer.innerHTML = `<p>${error.message}。请访问管理后台进行激活。</p>`;
    }
});