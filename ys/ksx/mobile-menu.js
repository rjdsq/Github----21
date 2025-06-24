// 移动端菜单交互逻辑
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            // 切换菜单显示状态
            navMenu.classList.toggle('active');
            // 切换汉堡菜单动画
            this.classList.toggle('active');
        });
        
        // 点击菜单外部关闭菜单
        document.addEventListener('click', function(event) {
            if (!navMenu.contains(event.target) && 
                !hamburger.contains(event.target) && 
                navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    }
});