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

    // Synchronize video source for label-page-2
    if (pageId === 'label-page-2') {
        const video1 = document.getElementById('video-player-1');
        const video2 = document.getElementById('video-player-2');
        video2.src = video1.src; // Use the same video source
        video2.currentTime = video1.currentTime; // Synchronize playback position
        video2.load();
    }
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

// 下一题按钮
nextQuestionBtn.addEventListener('click', function() {
    // Reset the input fields and selections
    document.getElementById('hypothesis-input').value = '';
    document.getElementById('reason-input').value = '';
    hypothesisCards.forEach(card => card.classList.remove('selected'));

    // Load a new random video
    loadRandomVideo();

    // Navigate back to the first annotation page
    showPage('label-page-1');
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
document.addEventListener('DOMContentLoaded', function () {
    handleVideoResize();

    // Fetch and render leaderboard data
    fetch('/api/users/leaderboard/')
        .then(response => {
            if (!response.ok) {
                throw new Error('无法加载排行榜数据');
            }
            return response.json();
        })
        .then(leaderboard => {
            const tableBody = document.querySelector('.leaderboard-table tbody');
            const leaderboardCards = document.querySelector('.leaderboard-cards');

            // Clear existing leaderboard data
            tableBody.innerHTML = '';
            leaderboardCards.innerHTML = '';

            // Populate leaderboard table
            leaderboard.forEach(entry => {
                const row = `
                    <tr>
                        <td class="rank">${entry.rank}</td>
                        <td>${entry.name}</td>
                        <td>${entry.labels_count}</td>
                    </tr>
                `;
                tableBody.innerHTML += row;

                // Populate leaderboard cards for mobile
                const card = `
                    <div class="leaderboard-card">
                        <div class="rank">${entry.rank}</div>
                        <div class="info">
                            <div class="name">${entry.name}</div>
                            <div class="count">${entry.labels_count} 个标注</div>
                        </div>
                    </div>
                `;
                leaderboardCards.innerHTML += card;
            });
        })
        .catch(error => {
            console.error('加载排行榜数据时出错:', error);
            alert('加载排行榜数据失败，请稍后重试');
        });
});

// 视频加载错误处理
document.querySelectorAll('.video-player').forEach(player => {
    const video = player.querySelector('video');
    video.onerror = () => {
        alert('视频加载失败，请检查视频链接或稍后重试。');
    };
});