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
import axios from 'axios'; // Add axios import
import VideoPlayer from '@/components/VideoPlayer';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import { API_URL } from '@/config'; // Import API_URL

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
  const [propositionsLoading, setPropositionsLoading] = useState(true);
  // Store proposition IDs
  const [propositions, setPropositions] = useState({
    prop1: { id: '', content: '' },
    prop2: { id: '', content: '' }
  });
  
  // 从上一步获取用户假设和视频ID
  const userHypothesis = location.state?.userHypothesis || '未提供假设';
  const videoId = location.state?.videoId || '';
  
  // 从上一步获取视频信息或使用默认值
  const videoInfo = location.state?.videoInfo || {
    src: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    title: '科学文献标注示例视频',
    description: '请选择您认为最接近的假设，并提供选择理由。'
  };

  // 假设选项 - 移到此处确保在渲染前被定义
  const hypothesisOptions = [
    {
      value: propositions.prop1.id || 'A',
      label: '假设A',
      content: propositions.prop1.content || '加载中...'
    },
    {
      value: propositions.prop2.id || 'B',
      label: '假设B',
      content: propositions.prop2.content || '加载中...'
    }
  ];

  // Fetch propositions for comparison when component mounts
  useEffect(() => {
    const fetchPropositions = async () => {
      if (!videoId) {
        message.error('未获取视频ID，无法加载假设数据');
        setPropositionsLoading(false);
        return;
      }
      
      setPropositionsLoading(true);
      
      try {
        const response = await axios.get(`${API_URL}/api/propositions/${videoId}`);
        
        if (response.data && response.data.length >= 2) {
          // Use the first two propositions from the API response
          setPropositions({
            prop1: { 
              id: response.data[0].id, 
              content: response.data[0].content 
            },
            prop2: { 
              id: response.data[1].id,
              content: response.data[1].content
            }
          });
        } else {
          // Handle case where API returns less than 2 propositions
          message.warning('可用的假设数据不足，使用默认数据');
          // Use fallback data
          setPropositions({
            prop1: { 
              id: 'default1', 
              content: '未找到足够的假设数据，这是默认假设A。' 
            },
            prop2: { 
              id: 'default2',
              content: '未找到足够的假设数据，这是默认假设B。'
            }
          });
        }
      } catch (error) {
        console.error('Error fetching propositions:', error);
        message.error('获取假设数据失败，请刷新重试');
        // Use fallback data in case of error
        setPropositions({
          prop1: { 
            id: 'error1', 
            content: '获取假设数据失败，这是默认假设A。' 
          },
          prop2: { 
            id: 'error2',
            content: '获取假设数据失败，这是默认假设B。'
          }
        });
      } finally {
        setPropositionsLoading(false);
      }
    };

    fetchPropositions();
  }, [videoId, API_URL]);

  // 处理返回上一步
  const handlePrevStep = () => {
    navigate('/annotation/step1');
  };

  // 处理提交
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      // Get user info from localStorage
      const userInfoString = localStorage.getItem('user_info');
      let userId = '';
      
      try {
        if (userInfoString) {
          const userInfo = JSON.parse(userInfoString);
          userId = userInfo.id || '';
        } else {
          message.warning('用户信息不存在，请重新登录');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('解析用户信息失败:', err);
        message.error('获取用户信息失败');
        setLoading(false);
        return;
      }
      
      // Prepare comparison data for submission
      const comparisonData = {
        proposition_id1: propositions.prop1.id,
        prososition_id2: propositions.prop2.id, // Note: there's a typo in the field name
        chosen: values.hypothesis, // The ID of the selected proposition
        reason: values.reason,
        user_id: userId
      };
      
      try {
        // Submit comparison to backend
        const response = await axios.post(`${API_URL}/api/comparison`, comparisonData);
        
        if (response.status === 200 || response.status === 201) {
          message.success('比较提交成功');
          
          // Find the selected hypothesis with error handling
          const selectedOption = hypothesisOptions.find(h => h.value === values.hypothesis) || {
            label: '假设',
            content: '已选择的假设'
          };
          
          // Navigate to success page
          navigate('/annotation/success', {
            state: {
              userHypothesis,
              selectedHypothesis: selectedOption,
              reason: values.reason
            }
          });
        } else {
          throw new Error('提交失败，请重试');
        }
      } catch (error) {
        console.error('提交比较失败:', error);
        message.error('提交比较失败，请重试');
        setLoading(false);
      }
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
                loading={propositionsLoading}
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