import React from 'react';
import { Layout, Typography, Space, Avatar, theme } from 'antd';

const { Footer } = Layout;
const { Title, Text } = Typography;

export default function AppFooter(){
    const { token } = theme.useToken();
    return (
        <Footer style={{ 
            textAlign: 'center', 
            background: token.colorBgLayout,
            padding: '12px 0'  // 减小底部高度
        }}>
            <Text type="secondary">SciQurio ©2025 科学假设标注平台</Text>
        </Footer>
    )
}