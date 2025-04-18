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