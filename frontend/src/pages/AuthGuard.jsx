import React, { useEffect } from 'react';
import { useGuard } from '@authing/guard-react';
import { useNavigate } from 'react-router-dom';

export default function AuthGuard() {
  const guard = useGuard();
  const navigate = useNavigate();

  useEffect(() => {
    // 处理登录回调
    const handleAuthCallback = async () => {
      try {
        // 检查当前会话
        const userInfo = await guard.trackSession();
        
        if (userInfo) {
          console.log('用户信息:', userInfo);
          // 存储用户信息到本地
          localStorage.setItem('user_info', JSON.stringify(userInfo));
          // 跳转到首页
          navigate('/home');
        } else {
          // 如果没有用户信息，启动 Guard 登录
          guard.start('#authing-guard-container').then((userInfo) => { // 移除了 : User 类型注解
            console.log('登录成功，用户信息:', userInfo);
            localStorage.setItem('user_info', JSON.stringify(userInfo));
            navigate('/home');
          }).catch((err) => {
            console.error('登录失败:', err);
            navigate('/home');
          });
        }
      } catch (err) {
        console.error('处理认证回调出错:', err);
        navigate('/home');
      }
    };

    handleAuthCallback();
  }, [guard, navigate]);

  return <div id="authing-guard-container"></div>;
}
