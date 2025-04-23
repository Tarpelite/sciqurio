import React from 'react';
import { Layout, Menu, Typography, Space } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const { Header } = Layout;
const { Title } = Typography;

const AppHeader = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Determine the current selected key based on path
  const getSelectedKey = (path) => {
    if (path === '/home' || path === '/') {
      return 'home';
    } else if (path.includes('/annotation') || 
               path.includes('/step1') || 
               path.includes('/step2') || 
               path.includes('/success')) {
      return 'annotate';
    }
    return '';
  };

  const selectedKey = getSelectedKey(currentPath);

  return (
    <>
      <Header
        style={{
          position: 'fixed',
          top: 0,
          zIndex: 1000,
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg,rgb(85, 135, 178) 0%,rgb(48, 58, 137) 100%)',
          padding: '0 32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="logo" style={{ marginLeft: '16px' }}>
          <Link to="/home">
            <Title level={4} style={{ margin: 0, color: '#fff' }}>SciQurio Leaderboard</Title>
          </Link>
        </div>
        
        <Menu
          mode="horizontal"
          selectedKeys={[selectedKey]}
          style={{
            flex: 1,
            minWidth: 0,
            justifyContent: 'flex-end',
            background: 'transparent',
            borderBottom: 'none',
          }}
          items={[
            {
              key: 'home',
              label: <Link to="/home" style={{ color: '#fff' }}>主页</Link>,
            },
            {
              key: 'annotate',
              label: <Link to="/annotation/step1" style={{ color: '#fff' }}>开始标注</Link>,
            }
          ]}
          theme="dark"
          overflowedIndicator={<></>}
          // Custom styles for the menu items
          className="header-menu"
        />
      </Header>
      {/* 占位元素，确保内容不会被固定头部遮挡 */}
      <div style={{ height: '72px' }} />
    </>
  );
};

export default AppHeader;
