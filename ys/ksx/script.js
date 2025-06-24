// 轮播图控制
let currentSlide = 0;
let slideInterval;
const slideDelay = 5000; // 5秒切换一次

// 初始化轮播图
function initCarousel(images) {
    const slidesContainer = document.querySelector('.carousel-slides');
    const dotsContainer = document.querySelector('.carousel-dots');
    
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
    
    // 添加按钮事件监听
    document.querySelector('.carousel-button.prev').addEventListener('click', prevSlide);
    document.querySelector('.carousel-button.next').addEventListener('click', nextSlide);
    
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
    stopSlideShow();
    slideInterval = setInterval(nextSlide, slideDelay);
}

// 停止自动轮播
function stopSlideShow() {
    if (slideInterval) {
        clearInterval(slideInterval);
    }
}

// 重置自动轮播计时器
function resetSlideShow() {
    stopSlideShow();
    startSlideShow();
}

// 从GitHub获取图片
async function fetchImages() {
    try {
        const response = await fetch('https://api.kkgithub.com/repos/rjdsq/rjdsq.github.io/contents/img/yunnan/');
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        const data = await response.json();
        
        // 将GitHub API返回的数据转换为轮播图需要的格式
        return data.reverse()
            .filter(item => item.type === 'file' && /\.(jpg|jpeg|png|gif|svg)$/i.test(item.name))
            .map(item => ({
                url: item.download_url.replace('https://raw.githubusercontent.com', 'https://raw.kkgithub.com'),
                name: item.name.replace(/\.\w+$/, '')
            }))
            .slice(0, 10); // 最多取10张图片用于轮播
    } catch (error) {
        console.error('获取图片失败:', error);
        return [];
    }
}

// 初始化轮播图
window.onload = async function() {
    const images = await fetchImages();
    if (images.length > 0) {
        initCarousel(images);
    }
};