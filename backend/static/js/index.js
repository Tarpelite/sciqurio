// DOM 元素获取
const pages = document.querySelectorAll('.page');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const nextQuestionBtn = document.getElementById('next-question-btn');
const exitBtn = document.getElementById('exit-btn');
const hypothesisCards = document.querySelectorAll('.hypothesis-card');
const collapsibles = document.querySelectorAll('.collapsible');

// 选项卡切换逻辑
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
    const tabId = btn.getAttribute('data-tab');
    
    // 更新激活的选项卡按钮
    tabBtns.forEach(btn => btn.classList.remove('active'));
    btn.classList.add('active');
    
    // 显示激活的选项卡内容
    tabContents.forEach(content => content.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    });
});

// 可折叠面板逻辑
collapsibles.forEach(collapsible => {
    collapsible.addEventListener('click', function() {
    this.classList.toggle('active');
    const content = this.nextElementSibling;
    if (content.style.maxHeight) {
        content.style.maxHeight = null;
    } else {
        content.style.maxHeight = content.scrollHeight + 'px';
    }
    });
});

// 假设卡片选择逻辑
hypothesisCards.forEach(card => {
    card.addEventListener('click', () => {
    hypothesisCards.forEach(c => c.classList.remove('selected'));
    card.classList.add('selected');
    });
});

// 页面导航函数
function showPage(pageId) {
    pages.forEach(page => {
    page.classList.remove('active-page');
    });
    document.getElementById(pageId).classList.add('active-page');
    window.scrollTo(0, 0);
}

// 用户信息点击事件
document.querySelectorAll('.user-info').forEach(info => {
    info.addEventListener('click', function() {
    showPage('home-page');
    });
});

// 确认选择按钮
confirmSelectionBtn.addEventListener('click', function() {
    const selectedCard = document.querySelector('.hypothesis-card.selected');
    const reasonInput = document.getElementById('reason-input');
    
    document.getElementById('hypothesis-input').value = '';
    document.getElementById('reason-input').value = '';
    hypothesisCards.forEach(card => card.classList.remove('selected'));
    
    // 返回第一个标注页面
    showPage('label-page-1');
});

// 退出按钮
exitBtn.addEventListener('click', function() {
    // 返回主页
    showPage('home-page');
});

// 响应式视频处理
function handleVideoResize() {
    const videoContainers = document.querySelectorAll('.video-player');
    videoContainers.forEach(container => {
    // 维持 16:9 宽高比
    const width = container.offsetWidth;
    const height = width * 0.5625; // 9/16 = 0.5625
    });
}

window.addEventListener('resize', handleVideoResize);
document.addEventListener('DOMContentLoaded', handleVideoResize);

// 视频加载错误处理
document.querySelectorAll('.video-player').forEach(player => {
    const video = player.querySelector('video');
    video.onerror = () => {
        alert('视频加载失败，请检查视频链接或稍后重试。');
    };
});