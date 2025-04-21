import React, { useEffect, useState } from 'react';
import { Layout, Typography, Space, Avatar, theme, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { AuthenticationClient } from 'authing-js-sdk';

const { Header } = Layout;
const { Title, Text } = Typography;

export default function AppHeader() {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [userName, setUserName] = useState(null); // 初始设为null表示加载状态
  const [loading, setLoading] = useState(true);

  const authing = new AuthenticationClient({
    appId: '68035ccfc5f4309865cede03',
    appHost: 'https://sciqurio.authing.cn',
  });

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await authing.getCurrentUser();
        setUserName(user?.name || '未登录');
      } catch (error) {
        console.error('获取用户信息失败:', error);
        setUserName('未登录');
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleJumpleHome = () => {
    navigate('/home');
  };

  return (
    <Header
      style={{
        background: token.colorBgContainer,
        padding: '0 48px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: `0 2px 8px ${token.colorBgElevated}`,
        height: '64px',
        position: 'fixed', // 改为fixed定位
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000, // 提高z-index
        width: '100vw',
        boxSizing: 'border-box'
      }}
    >
      <Title level={4} style={{ margin: 20, cursor: 'pointer' }} onClick={handleJumpleHome}>
        SciQurio LeaderBoard
      </Title>
      <Space>
        {loading ? (
          <Spin size="small" />
        ) : (
          <Text strong style={{ margin: 20 }}>{userName}</Text>
        )}
      </Space>
    </Header>
  );
}
