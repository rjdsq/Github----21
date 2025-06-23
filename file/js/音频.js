// 音乐播放控制逻辑
const playButton = document.getElementById('playButton');
const bgMusic = document.getElementById('bgMusic');
bgMusic.loop = true; // 添加循环属性
const playIcon = playButton.querySelector('i');
let isPlaying = false;

playButton.addEventListener('click', function() {
    if (isPlaying) {
        bgMusic.pause();
        playIcon.classList.remove('fa-pause');
        playIcon.classList.add('fa-play');
    } else {
        bgMusic.play();
        playIcon.classList.remove('fa-play');
        playIcon.classList.add('fa-pause');
    }
    isPlaying = !isPlaying;
});
