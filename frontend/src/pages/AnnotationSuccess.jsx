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
  Statistic,
  theme,
  Divider,
  Space,
  List
} from 'antd';
import { 
  CheckCircleFilled, 
  TrophyFilled, 
  RiseOutlined,
  HomeOutlined,
  FormOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;

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

  // 模拟用户获得的积分
  const points = 50;
  // 模拟用户累计标注次数
  const annotationCount = 5;
  // 模拟当前排名
  const currentRank = 12;

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
    <Layout style={{ minHeight: '100vh', width: '100%' }}>
      <AppHeader />
      
      <Content style={{ width: '100%', background: '#f0f2f5' }}>
        <div style={{ 
          padding: '16px 24px',
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
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
            {/* 左侧 - 成功信息 */}
            <Col xs={24} md={16}>
              <Card
                variant="bordered"
                bodyStyle={{ padding: '24px' }}
              >
                <Result
                  status="success"
                  icon={<CheckCircleFilled style={{ color: token.colorSuccess }} />}
                  title="标注成功！"
                  subTitle="感谢您的贡献，您的标注将帮助改进AI对科研文献的理解能力"
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
            
            {/* 右侧 - 数据统计 */}
            <Col xs={24} md={8}>
              <Card
                title={
                  <Space>
                    <TrophyFilled style={{ color: '#faad14' }} />
                    <span>标注成就</span>
                  </Space>
                }
                variant="bordered"
                styles={{
                  header: { padding: '16px 24px' },
                  body: { padding: '24px' }
                }}
              >
                <Row gutter={[16, 24]}>
                  <Col span={24}>
                    <Statistic
                      title="本次获得积分"
                      value={points}
                      valueStyle={{ color: token.colorSuccess }}
                      prefix={<RiseOutlined />}
                      suffix="分"
                    />
                  </Col>
                  
                  <Col span={12}>
                    <Statistic
                      title="累计标注次数"
                      value={annotationCount}
                      valueStyle={{ color: token.colorPrimary }}
                    />
                  </Col>
                  
                  <Col span={12}>
                    <Statistic
                      title="当前排名"
                      value={currentRank}
                      valueStyle={{ color: '#faad14' }}
                      suffix="名"
                    />
                  </Col>
                </Row>
                
                <Divider />
                
                <Paragraph>
                  <Text type="secondary">
                    您的标注质量将由专家审核，高质量的标注将获得额外积分奖励。继续保持！
                  </Text>
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

    <AppFooter />
    </Layout>
  );
};

export default AnnotationSuccess;