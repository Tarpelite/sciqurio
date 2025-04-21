import React from 'react';
import { Layout, Menu, Typography, Space } from 'antd';
import { Link } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = () => {
  return (
    <>
      <Header
        style={{
          position: 'fixed',
          top: 0,
          zIndex: 1000, // 确保在最上层
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#fff',
          padding: '0 24px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div className="logo">
          <Link to="/home">
            <Title level={4} style={{ margin: 0 }}>SciQurio Leaderboard</Title>
          </Link>
        </div>
        
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['home']}
          style={{ flex: 1, minWidth: 0, justifyContent: 'flex-end' }}
          items={[
            {
              key: 'home',
              label: <Link to="/home">主页</Link>,
            },
            {
              key: 'annotate',
              label: <Link to="/annotation/step1">开始标注</Link>,
            }
          ]}
        />
      </Header>
      {/* 占位元素，确保内容不会被固定头部遮挡 */}
      <div style={{ height: '64px' }} />
    </>
  );
};

export default AppHeader;
