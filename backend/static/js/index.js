// DOM 元素获取
const pages = document.querySelectorAll('.page');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const nextStepBtn = document.getElementById('next-step-btn');
const newVideoBtn = document.getElementById('new-video-btn');
const confirmSelectionBtn = document.getElementById('confirm-selection-btn');
const nextQuestionBtn = document.getElementById('next-question-btn');
const exitBtn = document.getElementById('exit-btn');
const hypothesisCards = document.querySelectorAll('.hypothesis-card');
const collapsibles = document.querySelectorAll('.collapsible');

// 初始化粒子背景
document.addEventListener('DOMContentLoaded', function() {
    // Particles.js 配置
    particlesJS('particles-js', {
    particles: {
        number: {
        value: 30, // 低密度粒子，保持清爽
        density: {
            enable: true,
            value_area: 800
        }
        },
        color: {
        value: '#ffffff'
        },
        shape: {
        type: 'circle',
        },
        opacity: {
        value: 0.3,
        random: true,
        },
        size: {
        value: 2,
        random: true,
        },
        line_linked: {
        enable: true,
        distance: 150,
        color: '#4DF0FF',
        opacity: 0.2,
        width: 1
        },
        move: {
        enable: true,
        speed: 1,
        direction: 'none',
        random: true,
        out_mode: 'out',
        }
    },
    interactivity: {
        detect_on: 'canvas',
        events: {
        onhover: {
            enable: true,
            mode: 'grab'
        },
        onclick: {
            enable: true,
            mode: 'push'
        },
        resize: true
        },
        modes: {
        grab: {
            distance: 140,
            line_linked: {
            opacity: 0.5
            }
        },
        push: {
            particles_nb: 3
        }
        }
    },
    retina_detect: true
    });
});

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

// 登录表单提交
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // 这里通常会处理与后端的身份验证
    
    // 获取邮箱用户名部分用于显示
    const username = document.getElementById('login-email').value.split('@')[0]; // Extract username from email
    const password = document.getElementById('login-password').value;

    fetch('/api/users/login/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: username,
        password: password
    })
    })
    .then(response => {
    if (!response.ok) {
        throw new Error('登录失败');
    }
    return response.json();
    })
    .then(data => {
    // Store token in localStorage for future API calls
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Update UI with user information
    updateUserInfoDisplay(data.user.username); // Pass the correct username from the response
    
    // Navigate to the first labeling page
    showPage('label-page-1');
    
    // Load a random video
    loadRandomVideo();
    })
    .catch(error => {
    alert(error.message);
    });
});

// 注册表单提交
registerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    // 获取注册表单数据
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const studentId = document.getElementById('register-student-id').value;
    const college = document.getElementById('register-college').value;

    console.log('Registering user:', {
        name: name,
        email: email,
        password: password,
        studentId: studentId,
        college: college
    });

    // 发送注册请求到后端
    fetch('/api/users/register/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password,
            student_id: studentId,
            college: college,
        })
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.email || '注册失败');
            });
        }
        return response.json();
    })
    .then(data => {
        // 注册成功，存储 token 并更新用户信息
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        updateUserInfoDisplay(data.user.name || data.user.username);
        showPage('label-page-1');
    })
    .catch(error => {
        // 显示后端返回的错误信息
        alert(error.message);
    });
});

// 更新用户信息显示
function updateUserInfoDisplay(name) {
    // 更新所有用户头像和名称
    document.querySelectorAll('.user-avatar').forEach(avatar => {
    avatar.textContent = name.charAt(0); // 取首字母作头像
    });
    
    document.querySelectorAll('.user-name').forEach(userName => {
    userName.textContent = name;
    });
}

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

// 换题按钮
newVideoBtn.addEventListener('click', function() {
    // 这里通常会从后端加载新视频
    alert('加载新视频...');
    // 重置输入字段
    document.getElementById('hypothesis-input').value = '';
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
    
    // 存储选择和理由以备后用
    const selectedHypothesis = selectedCard.getAttribute('data-hypothesis');
    sessionStorage.setItem('selectedHypothesis', selectedHypothesis);
    sessionStorage.setItem('selectionReason', reasonInput.value);
    
    // 导航到完成页面
    showPage('label-page-3');
});

// 下一题按钮
nextQuestionBtn.addEventListener('click', function() {
    // 重置输入
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