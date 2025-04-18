
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
// 登录表单提交
loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // 获取完整的邮箱地址
    const email = document.getElementById('login-email').value; // Use the full email address
    const password = document.getElementById('login-password').value;

    // Notify user that the email is being sent;

    fetch('/api/users/login/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            email: email, // Send the full email address
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
    const username = document.getElementById('register-username').value; // Add username field
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const studentId = document.getElementById('register-student-id').value;
    const college = document.getElementById('register-college').value;


    console.log('Registering user:', {
        username: username, // Include username in the log
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
            username: username, // Pass username to the backend
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