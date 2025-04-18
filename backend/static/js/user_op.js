document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Check if a valid token exists in sessionStorage
    const token = sessionStorage.getItem('token');
    const user = sessionStorage.getItem('user');

    if (token && user) {
        validateToken(token).then(isValid => {
            if (isValid) {
                const userData = JSON.parse(user); // Parse the user JSON string
                updateUserInfoDisplay(userData.name || userData.username); // Update user info display
                showPage('label-page-1'); // Automatically navigate to page 1
                loadRandomVideo(); // Load a random video
            } else {
                sessionStorage.removeItem('token'); // Remove invalid token
                sessionStorage.removeItem('user'); // Remove user info
            }
        });
    }

    // Handle login form submission
    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        fetch('/api/users/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('登录失败，请检查您的邮箱和密码');
            }
            return response.json();
        })
        .then(data => {
            console.log('登录成功:', data);
            sessionStorage.setItem('token', data.token); // Store token in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data.user)); // Store user info in sessionStorage
            updateUserInfoDisplay(data.user.name || data.user.username); // Update user info display
            showPage('label-page-1'); // Navigate to page 1 after successful login
        })
        .catch(error => {
            console.error('登录失败:', error);
            alert('登录失败，请稍后重试');
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
            sessionStorage.setItem('token', data.token); // Store token in sessionStorage
            sessionStorage.setItem('user', JSON.stringify(data.user)); // Store user info in sessionStorage
            updateUserInfoDisplay(data.user.name || data.user.username); // Update user info display
            showPage('label-page-1'); // Navigate to page 1 after successful registration
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
});

// Function to validate the token
function validateToken(token) {
    return fetch('/api/users/profile/', {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.ok)
    .catch(() => false);
}