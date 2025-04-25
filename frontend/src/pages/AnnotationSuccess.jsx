import React, { useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Typography, 
  Button, 
  Steps, 
  Row, 
  Col, 
  Result,
  theme,
  Divider,
  List
} from 'antd';
import { 
  CheckCircleFilled, 
  HomeOutlined,
  FormOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import AppHeader from '@/components/AppHeader';

const { Content } = Layout;
const { Title, Text } = Typography;

// 注意：需要安装 canvas-confetti 依赖
// npm install canvas-confetti --save

const AnnotationSuccess = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 从上一步获取标注信息
  const annotationData = {
    userHypothesis: location.state?.userHypothesis || '未提供假设',
    selectedHypothesis: location.state?.selectedHypothesis || { label: '未选择', content: '' },
    reason: location.state?.reason || '未提供理由'
  };

  // 庆祝效果
  useEffect(() => {
    // 在组件加载时触发彩带效果
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  // 返回主页
  const handleBackToHome = () => {
    navigate('/home');
  };

  // 继续标注
  const handleContinueAnnotation = () => {
    navigate('/annotation/step1');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Content
        style={{
          marginTop: 80,
          minHeight: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
        }}
      >
        <div style={{ maxWidth: 1200, width: '100%' }}>
          {/* 步骤指示器 */}
          <Card 
            variant="bordered" 
            style={{ marginBottom: '24px' }}
            bodyStyle={{ padding: '24px' }}
          >
            <Steps
              current={2}
              status="finish"
              items={[
                {
                  title: '提出假设',
                  description: '观看视频，提出您的科学假设',
                },
                {
                  title: '选择和论证',
                  description: '从给定选项中选择并论证',
                },
                {
                  title: '完成',
                  description: '提交您的标注结果',
                },
              ]}
            />
          </Card>
          <Row gutter={[24, 24]}>
            {/* 成功信息 - 调整为填满整个页面 */}
            <Col xs={24}>
              <Card
                variant="bordered"
                bodyStyle={{ padding: '24px' }}
              >
                <Result
                  status="success"
                  icon={<CheckCircleFilled style={{ color: token.colorSuccess }} />}
                  title="标注成功！"
                  subTitle="感谢您的贡献，您的标注将帮助改进AI的科学探索能力"
                  extra={[
                    <Button 
                      type="primary" 
                      key="continue" 
                      size="large"
                      icon={<FormOutlined />}
                      onClick={handleContinueAnnotation}
                    >
                      继续标注
                    </Button>,
                    <Button 
                      key="home" 
                      size="large"
                      icon={<HomeOutlined />}
                      onClick={handleBackToHome}
                    >
                      返回主页
                    </Button>,
                  ]}
                />
                
                <Divider />
                
                {/* 标注摘要 */}
                <Title level={4}>您的标注摘要</Title>
                <List
                  size="small"
                  bordered
                  style={{ background: token.colorBgContainer }}
                >
                  <List.Item>
                    <Text strong>您的假设：</Text> {annotationData.userHypothesis}
                  </List.Item>
                  <List.Item>
                    <Text strong>您选择的假设：</Text> {annotationData.selectedHypothesis.label} - {annotationData.selectedHypothesis.content}
                  </List.Item>
                  <List.Item>
                    <Text strong>选择理由：</Text> {annotationData.reason}
                  </List.Item>
                </List>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default AnnotationSuccess;