import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, App as AntApp, Layout } from 'antd';
import { zhCN } from 'antd/locale/zh_CN';
import { GuardProvider } from '@authing/guard-react';
import '@authing/guard-react/dist/esm/guard.min.css';
import './styles/global.css'; // 添加这一行导入全局样式

// 页面导入
import Home from "@/pages/home";
import AnnotationStep1 from "@/pages/AnnotationStep1";
import AnnotationStep2 from "@/pages/AnnotationStep2";
import AnnotationSuccess from "@/pages/AnnotationSuccess";
import AuthGuard from "@/pages/AuthGuard";
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';

const { Content } = Layout;

export default function App() {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 4,
        },
      }}
    >
      <GuardProvider
        appId="68035ccfc5f4309865cede03" // 替换为你的 Authing 应用 ID
        redirectUri="https://sciqurio.authing.cn/login" // 与回调 URL 一致
      >
        <AntApp>
          <BrowserRouter>
            <Layout style={{ minHeight: '100vh' }}>
              <AppHeader />
              <Content
                style={{
                  marginTop: 64, // Header 高度补偿
                  width: '100%',
                  background: '#f0f2f5',
                  flex: 1
                }}
              >
                <Routes>
                  {/* 认证守卫页面 */}
                  <Route path="/auth-guard" element={<AuthGuard />} />
                  
                  {/* 主页 */}
                  <Route path="/home" element={<Home />} />
                  
                  {/* 标注流程 */}
                  <Route path="/annotation/step1" element={<AnnotationStep1 />} />
                  <Route path="/annotation/step2" element={<AnnotationStep2 />} />
                  <Route path="/annotation/success" element={<AnnotationSuccess />} />
                  
                  {/* 默认重定向到认证页面 */}
                  <Route path="/" element={<Navigate to="/auth-guard" replace />} />
                  
                  {/* 捕获所有其他路径，重定向到认证页面 */}
                  <Route path="*" element={<Navigate to="/auth-guard" replace />} />
                </Routes>
              </Content>
              <AppFooter />
            </Layout>
          </BrowserRouter>
        </AntApp>
      </GuardProvider>
    </ConfigProvider>
  );
}
