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
          background: 'linear-gradient(90deg,rgb(85, 135, 178) 0%,rgb(48, 58, 137) 100%)', // 背景渐变色
          padding: '0 32px', // 增加左右间距
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // 更柔和的阴影
        }}
      >
        <div className="logo" style={{ marginLeft: '16px' }}> {/* 增加左侧外边距 */}
          <Link to="/home">
            <Title level={4} style={{ margin: 0, color: '#fff' }}>SciQurio Leaderboard</Title> {/* 修改文字颜色 */}
          </Link>
        </div>
        
        <Menu
          mode="horizontal"
          defaultSelectedKeys={['home']}
          style={{
            flex: 1,
            minWidth: 0,
            justifyContent: 'flex-end',
            background: 'transparent', // 去除菜单背景
            borderBottom: 'none', // 去除底部边框
          }}
          items={[
            {
              key: 'home',
              label: <Link to="/home" style={{ color: '#fff' }}>主页</Link>, // 修改文字颜色
            },
            {
              key: 'annotate',
              label: <Link to="/annotation/step1" style={{ color: '#fff' }}>开始标注</Link>, // 修改文字颜色
            }
          ]}
        />
      </Header>
      {/* 占位元素，确保内容不会被固定头部遮挡 */}
      <div style={{ height: '72px' }} /> {/* 调整占位高度 */}
    </>
  );
};

export default AppHeader;
