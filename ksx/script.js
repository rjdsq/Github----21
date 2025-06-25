// 文本处理函数 - 将换行符转换为<br>
function processText(text) {
    return text
        // 统一所有换行符为\n
        .replace(/\r\n|\r|\u2028|\u2029/g, '\n')
        // 将换行符转换为<br>
        .replace(/\n/g, '<br>');
}

// 加载文本内容
function loadTextContents() {
    apiConfig.textFiles.files.forEach(({id, path}) => {
        const element = document.getElementById(id);
        if (!element) return;
        
        element.innerHTML = "正在加载...";
        
        fetch(`${apiConfig.textFiles.baseUrl}${path}`)
            .then(response => response.ok ? response.text() : Promise.reject('文件获取失败'))
            .then(text => { element.innerHTML = processText(text); })
            .catch(error => { element.innerHTML = `加载错误，请检查是否联网`; });
    });
}

// 加载图片内容
function loadImageContents() {
    const message = document.getElementById('message');
    if (!message) return;

    message.innerHTML = "正在加载图片...";

    fetch(`${apiConfig.images.baseUrl}${apiConfig.images.path}`)
        .then(response => response.json())
        .then(data => {
            message.innerHTML = '';
            // 核心修改：逆序排列数组（从新到旧）
            const reversedData = data.reverse();
            
            reversedData.forEach(item => {
                if (item.type === 'file' && /\.(jpg|jpeg|png|gif|svg)$/i.test(item.name)) {
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'image-container';
                    
                    const img = document.createElement('img');
                    const kkgithubUrl = apiConfig.domainReplace.reduce((currentUrl, rule) => {
                        return currentUrl.replace(rule.from, rule.to);
                    }, item.download_url);
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
}

// 轮播图控制
let currentSlide = 0;
let slideInterval;
let slideDelay = 5000; // 默认值5秒

// 初始化轮播图
function initCarousel(images) {
    console.log('初始化轮播图，图片数量:', images.length);
    if (!apiConfig.carousel) {
        console.warn('缺少轮播图配置，使用默认值');
        apiConfig.carousel = {
            slideDelay: 5000,
            maxSlides: 5
        };
    }
    slideDelay = apiConfig.carousel.slideDelay || 5000;
    
    const slidesContainer = document.querySelector('.carousel-slides');
    const dotsContainer = document.querySelector('.carousel-dots');
    
    if (!slidesContainer || !dotsContainer) {
        console.error('轮播图容器元素未找到');
        return;
    }
    
    // 清空现有内容
    slidesContainer.innerHTML = '';
    dotsContainer.innerHTML = '';
    
    // 添加图片到轮播图
    images.forEach((image, index) => {
        // 创建轮播图片
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        
        const img = document.createElement('img');
        // 先不设置src，显示加载中状态
        img.alt = `轮播图片 ${index + 1}`;
        
        // 添加加载错误处理
        img.onerror = function() {
            this.classList.add('error');
            console.error(`图片加载失败: ${image.url}`);
        };
        
        // 添加加载完成处理
        img.onload = function() {
            this.classList.remove('error');
        };
        
        // 设置图片源
        img.src = image.url;
        
        // 添加标题
        if (image.name) {
            const caption = document.createElement('div');
            caption.className = 'carousel-caption';
            caption.textContent = image.name;
            slide.appendChild(caption);
        }
        
        slide.appendChild(img);
        slidesContainer.appendChild(slide);
        
        // 创建指示点
        const dot = document.createElement('div');
        dot.className = 'carousel-dot';
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    // 设置初始状态
    updateCarousel();
    
    // 添加轮播控制功能
    const carouselContainer = document.querySelector('.carousel');
    
    // 鼠标悬停控制
    if (carouselContainer) {
        carouselContainer.addEventListener('mouseenter', () => {
            console.log('鼠标进入，暂停轮播');
            stopSlideShow();
        });
        
        carouselContainer.addEventListener('mouseleave', () => {
            console.log('鼠标离开，恢复轮播');
            startSlideShow();
        });
    }
    
    // 按钮控制（可选）
    const prevButton = document.querySelector('.carousel-prev, .carousel-button.prev, .prev-button');
    const nextButton = document.querySelector('.carousel-next, .carousel-button.next, .next-button');
    
    if (prevButton) {
        prevButton.addEventListener('click', () => {
            console.log('上一张按钮点击');
            prevSlide();
            resetSlideShow();
        });
    } else {
        console.warn('上一张按钮未找到，自动轮播仍可工作');
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', () => {
            console.log('下一张按钮点击');
            nextSlide();
            resetSlideShow();
        });
    } else {
        console.warn('下一张按钮未找到，自动轮播仍可工作');
    }
    
    // 启动自动轮播
    startSlideShow();
}

// 更新轮播图显示
function updateCarousel() {
    const slides = document.querySelector('.carousel-slides');
    slides.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // 更新指示点
    document.querySelectorAll('.carousel-dot').forEach((dot, index) => {
        if (index === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// 下一张幻灯片
function nextSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
    resetSlideShow();
}

// 上一张幻灯片
function prevSlide() {
    const slides = document.querySelectorAll('.carousel-slide');
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel();
    resetSlideShow();
}

// 跳转到指定幻灯片
function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
    resetSlideShow();
}

// 开始自动轮播
function startSlideShow() {
    console.log('启动轮播，间隔:', slideDelay);
    stopSlideShow();
    slideInterval = setInterval(() => {
        console.log('自动切换到下一张');
        nextSlide();
    }, slideDelay);
}

// 停止自动轮播
function stopSlideShow() {
    if (slideInterval) {
        console.log('停止轮播');
        clearInterval(slideInterval);
        slideInterval = null;
    }
}

// 重置自动轮播计时器
function resetSlideShow() {
    console.log('重置轮播计时器');
    stopSlideShow();
    startSlideShow();
}

// 从GitHub获取图片轮播图
async function fetchImages() {
    try {
        const response = await fetch(`${apiConfig.carouselImages.baseUrl}${apiConfig.carouselImages.path}`);
        if (!response.ok) {
            throw new Error('轮播图图片加载失败');
        }
        const data = await response.json();
        
        // 将GitHub API返回的数据转换为轮播图需要的格式
        return data.reverse()
            .filter(item => item.type === 'file' && /\.(jpg|jpeg|png|gif|svg)$/i.test(item.name))
            .map(item => ({
                url: apiConfig.domainReplace.reduce((currentUrl, rule) => {
                    return currentUrl.replace(rule.from, rule.to);
                }, item.download_url),
                name: item.name.replace(/\.\w+$/, '')
            }))
            .slice(0, apiConfig.carousel.maxSlides); // 使用配置中的最大显示张数
    } catch (error) {
        console.error('获取轮播图图片失败:', error);
        return [];
    }
}

// 页面加载完成后初始化所有功能
document.addEventListener('DOMContentLoaded', async () => {
    // 加载文本内容
    loadTextContents();
    
    // 加载图片内容
    loadImageContents();
    
    // 初始化轮播图
    const images = await fetchImages();
    if (images.length > 0) {
        initCarousel(images);
    }
});