import React, { useState, useEffect, useRef } from 'react';
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
  App 
} from 'antd';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import { API_URL } from '@/config';
import { api } from '../utils/api';
import { refreshLayout } from '../utils/layoutUtils';

const { Content } = Layout;
const { Text, Paragraph } = Typography;
const { TextArea } = Input;

const AnnotationStep1 = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [selectedHypothesis, setSelectedHypothesis] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [propositionsLoading, setPropositionsLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoInfo, setVideoInfo] = useState({
    src: '',
    title: '',
    description: '',
    video_id: ''
  });
  
  // Add a ref to track if API call has been made
  const apiCallMadeRef = useRef(false);
  
  // Store proposition IDs
  const [propositions, setPropositions] = useState({
    prop1: { id: '', content: '' },
    prop2: { id: '', content: '' }
  });

  // Fetch random video when component mounts
  useEffect(() => {
    const fetchVideoInfo = async () => {
      // Check if API call has already been made to prevent duplicate calls
      if (apiCallMadeRef.current) return;
      apiCallMadeRef.current = true;
      
      try {
        const response = await api.get(`${API_URL}/api/random_video`);
        
        if (response.status !== 200) {
          throw new Error('Failed to fetch video data');
        }
        
        const dataset = response.data.dataset;
        const wellLink = `https://polymathic-ai.org/the_well/datasets/${dataset}/`;
        const wellTitle = `The Well (${dataset})`;
        
        // Store video_id in localStorage for persistence between steps
        localStorage.setItem('current_video_id', response.data.video_id);
        // Store full video info for easy retrieval in step2
        localStorage.setItem('current_video_info', JSON.stringify({
          src: `${API_URL}/${response.data.storage_path}`,
          title: wellTitle,
          link: wellLink,
          description: response.data.description,
          video_id: response.data.video_id
        }));
        
        setVideoInfo({
          src: `${API_URL}/${response.data.storage_path}`,
          title: wellTitle,
          link: wellLink,
          description: response.data.description,
          video_id: response.data.video_id
        });
        
        // After setting video info, fetch propositions for this video
        fetchPropositions(response.data.video_id);
      } catch (error) {
        console.error('Error fetching video data:', error);
        message.error('Failed to load video data');
        // Fallback to default video info
        const defaultDataset = 'convective_envelope_rsg';
        const defaultWellLink = `https://polymathic-ai.org/the_well/datasets/${defaultDataset}/`;
        const defaultWellTitle = `The Well (${defaultDataset})`;
        
        setVideoInfo({
          src: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
          title: defaultWellTitle,
          link: defaultWellLink,
          description: '请选择您认为最接近的假设，并提供选择理由。',
          video_id: 'default_video_id'
        });
        fetchPropositions('default_video_id');
      } finally {
        setVideoLoading(false);
      }
    };

    fetchVideoInfo();
  }, []);

  // Fetch propositions for comparison
  const fetchPropositions = async (videoId) => {
    if (!videoId) {
      message.error('未获取视频ID，无法加载假设数据');
      setPropositionsLoading(false);
      refreshLayout();
      return;
    }
    
    setPropositionsLoading(true);
    
    try {
      const response = await api.get(`${API_URL}/api/propositions/${videoId}`);
      
      if (response.data && response.data.length >= 2) {
        const propData = {
          prop1: { 
            id: response.data[0].id, 
            content: response.data[0].content 
          },
          prop2: { 
            id: response.data[1].id,
            content: response.data[1].content
          }
        };
        setPropositions(propData);
        // 存储到 localStorage，方便 step2 使用
        localStorage.setItem('current_propositions', JSON.stringify([
          { id: propData.prop1.id, label: '假设A', content: propData.prop1.content },
          { id: propData.prop2.id, label: '假设B', content: propData.prop2.content }
        ]));
      } else {
        const fallback = {
          prop1: { 
            id: 'default1', 
            content: '未找到足够的假设数据，这是默认假设A。' 
          },
          prop2: { 
            id: 'default2',
            content: '未找到足够的假设数据，这是默认假设B。'
          }
        };
        setPropositions(fallback);
        localStorage.setItem('current_propositions', JSON.stringify([
          { id: fallback.prop1.id, label: '假设A', content: fallback.prop1.content },
          { id: fallback.prop2.id, label: '假设B', content: fallback.prop2.content }
        ]));
        message.warning('可用的假设数据不足，使用默认数据');
      }
    } catch (error) {
      const fallback = {
        prop1: { 
          id: 'error1', 
          content: '获取假设数据失败，这是默认假设A。' 
        },
        prop2: { 
          id: 'error2',
          content: '获取假设数据失败，这是默认假设B。'
        }
      };
      setPropositions(fallback);
      localStorage.setItem('current_propositions', JSON.stringify([
        { id: fallback.prop1.id, label: '假设A', content: fallback.prop1.content },
        { id: fallback.prop2.id, label: '假设B', content: fallback.prop2.content }
      ]));
      message.error('获取假设数据失败，请刷新重试');
    } finally {
      setPropositionsLoading(false);
      refreshLayout();
    }
  };

  // 假设选项
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

  // 处理下一步 - Modified to submit comparison data to API
  const handleNextStep = async () => {
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
        proposition_id2: propositions.prop2.id, // 修正拼写
        chosen: values.hypothesis, // The ID of the selected proposition
        reason: values.reason,
        user_id: userId
      };
      
      try {
        // Submit comparison to backend
        const response = await api.post(`${API_URL}/api/comparison`, comparisonData);
        
        if (response.status === 200 || response.status === 201) {
          message.success('比较提交成功');
          
          // Store the user's selection and reason
          localStorage.setItem('selected_hypothesis', values.hypothesis);
          localStorage.setItem('selection_reason', values.reason);
          
          // Navigate to next step with video information
          navigate('/annotation/step2');
        } else {
          throw new Error('提交失败，请重试');
        }
      } catch (error) {
        console.error('提交比较失败:', error);
        message.error('提交比较失败，请重试');
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
  };

  // 处理视频结束事件
  const handleVideoEnded = () => {
    message.success('视频播放完成，请选择一个假设');
  };

  return (
    <Layout 
    style={{ minHeight: '100vh' }}
    >
      <Content
        style={{
          marginTop: 80, // Header高度
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
            styles={{ body: { padding: '24px' } }}
          >
            <Steps
              current={0}
              items={[
                {
                  title: '选择和论证',
                  description: '从给定选项中选择并论证',
                },
                {
                  title: '提出假设',
                  description: '观看视频，提出您的科学假设',
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
              {videoLoading ? (
                <Card loading={true} style={{ minHeight: 600 }} />
              ) : (
                <VideoPlayer
                  src={videoInfo.src}
                  title={videoInfo.title}
                  link={videoInfo.link}
                  description={videoInfo.description}
                  onEnded={handleVideoEnded}
                />
              )}
            </Col>
            
            {/* 右侧 - 假设选择和理由输入 */}
            <Col xs={24} md={10}>
              <Card
                title="选择更合适的假设"
                variant="bordered"
                styles={{
                  header: { padding: '16px 24px' },
                  body: { padding: '16px 24px' }
                }}
                loading={propositionsLoading || videoLoading}
              >
                <Form 
                  form={form}
                  layout="vertical"
                  requiredMark={false}
                >
                  <Form.Item
                    name="hypothesis"
                    label="请选择一个假设"
                    rules={[{ required: true, message: '请选择一个假设' }]}
                  >
                    <Radio.Group 
                      onChange={(e) => {
                        setSelectedHypothesis(e.target.value);
                        refreshLayout();
                      }}
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
                      autoSize={{ minRows: 6, maxRows: 8 }}
                      maxLength={1000}
                      showCount
                      onChange={(e) => setReason(e.target.value)}
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <Button
                      type="primary"
                      size="large"
                      onClick={handleNextStep}
                      loading={loading}
                      disabled={!selectedHypothesis || !reason.trim()}
                      style={{ width: '100%' }}
                    >
                      下一步
                    </Button>
                  </Form.Item>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
};

export default AnnotationStep1;