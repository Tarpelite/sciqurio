const confirmSelectionBtn = document.getElementById('confirm-selection-btn');
const newVideoBtn = document.getElementById('new-video-btn');
const nextStepBtn = document.getElementById('next-step-btn');
// 下一步按钮
nextStepBtn.addEventListener('click', function() {
    const hypothesisInput = document.getElementById('hypothesis-input');
    
    if (hypothesisInput.value.trim() === '') {
    alert('请输入您的科学假设');
    return;
    }
    
    // 存储假设以备后用
    sessionStorage.setItem('userHypothesis', hypothesisInput.value);
    
    // 导航到第二个标注页面
    showPage('label-page-2');
    
    // 同步视频播放位置
    const video1 = document.getElementById('video-player-1');
    const video2 = document.getElementById('video-player-2');
    video2.currentTime = video1.currentTime;
});


// 确认选择按钮
confirmSelectionBtn.addEventListener('click', function() {
    const selectedCard = document.querySelector('.hypothesis-card.selected');
    const reasonInput = document.getElementById('reason-input');
    
    if (!selectedCard) {
        alert('请选择一个假设');
        return;
    }
    
    if (reasonInput.value.trim() === '') {
        alert('请输入选择该假设的理由');
        return;
    }
    
    // 获取存储的用户假设和选择
    const userHypothesis = sessionStorage.getItem('userHypothesis');
    const selectedHypothesisId = selectedCard.getAttribute('hypothesis-id');
    const reason = reasonInput.value;

    // 从 sessionStorage 获取 video_id
    const videoId = sessionStorage.getItem('currentVideoId');
    if (!videoId) {
        alert('无法获取视频 ID，请刷新页面后重试');
        return;
    }

    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    fetch('/api/hypotheses/user/', {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            video: videoId,
            content: userHypothesis,
        }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('无法保存用户假设');
        }
        return response.json();
    })
    .then(userHypothesisData => {
        // 提交假设比较到后端
        return fetch('/api/hypotheses/compare/', {
            method: 'POST',
            headers: {
                'Authorization': `Token ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                video: videoId,
                user_hypothesis: userHypothesisData.id,
                selected_hypothesis: selectedHypothesisId,
                reason: reason,
            }),
        });
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('无法保存假设比较');
        }
        return response.json();
    })
    .then(() => {
        // 导航到完成页面
        showPage('label-page-3');
    })
    .catch(error => {
        console.error('保存数据时出错:', error);
        alert('保存数据失败，请稍后重试');
    });
});

function loadHypothesesForVideo() {
    const videoId = sessionStorage.getItem('currentVideoId');
    if (!videoId) {
        alert('无法获取视频 ID，请刷新页面后重试');
        return;
    }

    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    fetch(`/api/hypotheses/video/${videoId}/`, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('无法加载假设');
        }
        return response.json();
    })
    .then(hypotheses => {
        const container = document.querySelector('.hypothesis-cards');
        container.innerHTML = ''; // Clear existing hypotheses

        hypotheses.forEach((hypothesis, index) => {
            const card = document.createElement('div');
            card.className = 'hypothesis-card';
            card.setAttribute('hypothesis-id', hypothesis.id);

            const title = `假设 ${String.fromCharCode(65 + index)}`; // Generate title like 假设A, 假设B, etc.

            card.innerHTML = `
                <div class="card-selector"></div>
                <h3>${title}</h3>
                <p>${hypothesis.content}</p>
            `;

            container.appendChild(card);
        });
    })
    .catch(error => {
        console.error('加载假设时出错:', error);
        alert('加载假设失败，请稍后重试');
    });
}

// Call this function when the page loads or the video changes
// loadHypothesesForVideo();

// 换题按钮
newVideoBtn.addEventListener('click', function() {
    // 这里通常会从后端加载新视频
    loadRandomVideo();
    // 重置输入字段
    document.getElementById('hypothesis-input').value = '';
});