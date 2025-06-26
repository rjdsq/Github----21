// API地址配置
const apiConfig = {
    // 文本文件API地址
    textFiles: {
        baseUrl: 'https://raw.githubusercontent.com/rjdsq/rjdsq.github.io/main/',
        path: '',
        files: [
            { id: 'text1', path: '选项卡1.txt' },
            { id: 'text2', path: '选项卡2.txt' },
            { id: 'text3', path: '选项卡3.txt' }
        ]
    },
    // 通用图片API地址
    images: {
        baseUrl: 'https://api.github.com/repos/rjdsq/rjdsq.github.io/contents/',
        path: 'img/yunnan/'
    },
    // 轮播图专用图片API地址
    carouselImages: {
        baseUrl: 'https://api.github.com/repos/rjdsq/rjdsq.github.io/contents/',
        path: 'img/yunnan/'  // 轮播图专用图片路径
    },
    // 全局域名替换规则
    domainReplace: [
        {
            from: 'https://raw.githubusercontent.com',
            to: 'https://raw.kkgithub.com'
        },
        {
            from: 'https://api.github.com',
            to: 'https://raw.kkgithub.com'
        }
    ],
    // 轮播图配置
    carousel: {
        slideDelay: 5000, // 轮播切换延迟(毫秒)
        maxSlides: 5      // 最大显示张数
    }
};