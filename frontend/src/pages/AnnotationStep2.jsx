import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Typography, 
  Input, 
  Button, 
  Steps, 
  Row, 
  Col, 
  Space,
  Form,
  Radio,
  message,
  theme,
  Alert
} from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AnnotationStep2 = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  const [selectedHypothesis, setSelectedHypothesis] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 从上一步获取用户假设
  const userHypothesis = location.state?.userHypothesis || '未提供假设';

  // 模拟视频信息
  const videoInfo = {
    src: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', // 替换为实际视频URL
    title: '科学文献标注示例视频',
    description: '请选择您认为最接近的假设，并提供选择理由。'
  };

  // 模拟系统生成的假设选项
  const hypothesisOptions = [
    {
      value: 'A',
      label: '假设A',
      content: '调整饮食结构可以显著降低2型糖尿病的发病风险，尤其是减少精制碳水化合物的摄入。'
    },
    {
      value: 'B',
      label: '假设B',
      content: '长期规律的有氧运动与力量训练相结合是预防2型糖尿病最有效的非药物干预方法。'
    }
  ];

  // 处理返回上一步
  const handlePrevStep = () => {
    navigate('/annotation/step1');
  };

  // 处理提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // 模拟API提交
      setTimeout(() => {
        setLoading(false);
        // 导航到成功页面
        navigate('/annotation/success', {
          state: {
            userHypothesis,
            selectedHypothesis: hypothesisOptions.find(h => h.value === values.hypothesis),
            reason: values.reason
          }
        });
      }, 1500);
    } catch (error) {
      console.error('表单验证失败:', error);
    }
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
              current={1}
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
            {/* 左侧 - 视频播放器 */}
            <Col xs={24} md={14}>
              <VideoPlayer
                src={videoInfo.src}
                title={videoInfo.title}
                description={videoInfo.description}
              />
              
            </Col>
            
            {/* 右侧 - 假设选择和理由输入 */}
            <Col xs={24} md={10}>
              <Card
                title="选择最合适的假设"
                variant="bordered"
                styles={{
                  header: { padding: '16px 24px' },
                  body: { padding: '16px 24px' }
                }}
              >
                <Form 
                  form={form}
                  layout="vertical"
                  requiredMark={false}
                >
                  <Form.Item
                    name="hypothesis"
                    label="请选择一个的假设"
                    rules={[{ required: true, message: '请选择一个假设' }]}
                  >
                    <Radio.Group 
                      onChange={(e) => setSelectedHypothesis(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {hypothesisOptions.map(option => (
                          <Radio 
                            key={option.value} 
                            value={option.value}
                            style={{ 
                              width: '100%',
                              display: 'flex',
                              alignItems: 'flex-start',
                              marginBottom: '8px'
                            }}
                          >
                            <div>
                              <Text strong>{option.label}</Text>: {option.content}
                            </div>
                          </Radio>
                        ))}
                      </Space>
                    </Radio.Group>
                  </Form.Item>
                  
                  <Form.Item
                    name="reason"
                    label="请说明您选择该假设的理由"
                    rules={[
                      { required: true, message: '请输入您的选择理由' },
                      { min: 20, message: '理由至少需要20个字符' }
                    ]}
                  >
                    <TextArea
                      placeholder="请详细说明您为什么选择该假设..."
                      autoSize={{ minRows: 4, maxRows: 8 }}
                      maxLength={1000}
                      showCount
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Button 
                        size="large" 
                        onClick={handlePrevStep}
                        style={{ width: '100%' }}
                      >
                        返回上一步
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!selectedHypothesis || !reason.trim()}
                        style={{ width: '100%' }}
                      >
                        确认提交
                      </Button>
                    </Space>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>

    <AppFooter />
    </Layout>
  );
};

export default AnnotationStep2;