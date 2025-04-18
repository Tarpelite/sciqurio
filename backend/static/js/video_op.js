

// 加载随机视频函数
function loadRandomVideo() {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage

    fetch('/api/videos/random/', {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`, // Include the token in the Authorization header
            'Content-Type': 'application/json',
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('无法加载随机视频');
        }
        return response.json();
    })
    .then(data => {
        const videoPlayer = document.getElementById('video-player-1');
        videoPlayer.src = data.video_url; // Set the video source
        videoPlayer.load(); // Load the new video

        // Store the video_id in sessionStorage
        sessionStorage.setItem('currentVideoId', data.video_id);
    })
    .catch(error => {
        console.error('加载随机视频时出错:', error);
        alert('加载随机视频失败，请稍后重试');
    });
}