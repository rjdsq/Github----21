const GitHubAPI = {
    BASE_URL: 'https://api.github.com',

    async request(token, endpoint, options = {}) {
        const url = `${this.BASE_URL}${endpoint}`;
        const headers = {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            ...options.headers,
        };
        const response = await fetch(url, { ...options, headers });
        if (response.status === 404) return null;
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'GitHub API request failed' }));
            throw new Error(errorData.message);
        }
        if (response.status === 204 || response.headers.get("Content-Length") === "0") {
            return null;
        }
        return response.json();
    },

    async getFileContent(token, owner, repo, path) {
        const result = await this.request(token, `/repos/${owner}/${repo}/contents/${path}`);
        if (!result) return null;
        const content = atob(result.content);
        return { content, sha: result.sha };
    },

    createFile: (token, owner, repo, path, content, message, isBinary = false) => {
        return GitHubAPI.request(token, `/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify({
                message,
                content: isBinary ? content : btoa(unescape(encodeURIComponent(content))),
            }),
        });
    },

    updateFile: (token, owner, repo, path, content, sha, message) => {
        return GitHubAPI.request(token, `/repos/${owner}/${repo}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify({
                message,
                content: btoa(unescape(encodeURIComponent(content))),
                sha,
            }),
        });
    },
};