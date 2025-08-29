document.addEventListener('DOMContentLoaded', async () => {
    const converter = new showdown.Converter();
    const blogTitleEl = document.getElementById('blog-title');
    const blogDescriptionEl = document.getElementById('blog-description');
    const postsContainer = document.getElementById('posts-container');

    try {
        const configRes = await fetch('config.json');
        if (!configRes.ok) throw new Error('博客未初始化');
        const config = await configRes.json();
        document.title = config.title;
        blogTitleEl.textContent = config.title;
        blogDescriptionEl.textContent = config.description;

        const postsRes = await fetch('posts.json');
        if (!postsRes.ok) throw new Error('无法加载文章');
        const posts = await postsRes.json();

        postsContainer.innerHTML = '';
        if (posts.length > 0) {
            posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            posts.forEach(post => {
                const postEl = document.createElement('article');
                postEl.className = 'post';

                const titleEl = document.createElement('h2');
                titleEl.className = 'post-title';
                titleEl.textContent = post.title;

                const metaEl = document.createElement('p');
                metaEl.className = 'post-meta';
                const postDate = new Date(post.createdAt).toLocaleDateString();
                metaEl.textContent = `发布于 ${postDate}`;

                const contentEl = document.createElement('div');
                contentEl.className = 'post-content';
                contentEl.innerHTML = converter.makeHtml(post.content);

                postEl.appendChild(titleEl);
                postEl.appendChild(metaEl);
                postEl.appendChild(contentEl);
                postsContainer.appendChild(postEl);
            });
        } else {
            postsContainer.innerHTML = '<p>暂无文章。</p>';
        }
    } catch (error) {
        blogTitleEl.textContent = '错误';
        postsContainer.innerHTML = `<p>${error.message}。请先访问管理后台进行激活。</p>`;
    }
});