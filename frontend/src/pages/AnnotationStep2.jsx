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
  message,
  theme,
  App
} from 'antd';
import { useNavigate } from 'react-router-dom';
import VideoPlayer from '@/components/VideoPlayer';
import { API_URL } from '@/config';
import { api } from '../utils/api';

const { Content } = Layout;
const { Paragraph } = Typography;
const { TextArea } = Input;

const AnnotationStep2 = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [hypothesis, setHypothesis] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoInfo, setVideoInfo] = useState({
    src: '',
    title: '',
    description: '',
    video_id: ''
  });

  // Get video info from localStorage when component mounts
  useEffect(() => {
    // Try to get video info from localStorage
    const storedVideoInfoStr = localStorage.getItem('current_video_info');
    const videoId = localStorage.getItem('current_video_id');
    
    if (storedVideoInfoStr) {
      try {
        const storedVideoInfo = JSON.parse(storedVideoInfoStr);
        setVideoInfo(storedVideoInfo);
        setVideoLoading(false);
      } catch (error) {
        console.error('Error parsing stored video info:', error);
        fetchVideoById(videoId);
      }
    } else if (videoId) {
      // If we only have the ID, fetch the full video info
      fetchVideoById(videoId);
    } else {
      // No video info available, redirect back to step1
      message.error('No video selected, returning to step 1');
      navigate('/annotation/step1');
    }
  }, [navigate]);

  // Fetch video by ID if needed
  const fetchVideoById = async (videoId) => {
    try {
      // This API endpoint might need to be implemented on your backend
      const response = await api.get(`${API_URL}/api/video/${videoId}`);
      
      if (response.status === 200) {
        const dataset = response.data.dataset;
        const wellLink = `https://polymathic-ai.org/the_well/datasets/${dataset}/`;
        const wellTitle = `The Well (${dataset})`;
        
        const videoData = {
          src: `${API_URL}/${response.data.storage_path}`,
          title: wellTitle,
          link: wellLink,
          description: response.data.description,
          video_id: response.data.video_id
        };
        
        setVideoInfo(videoData);
      } else {
        throw new Error('Failed to fetch video data');
      }
    } catch (error) {
      console.error('Error fetching video by ID:', error);
      message.error('Failed to load video data');
      navigate('/annotation/step1');
    } finally {
      setVideoLoading(false);
    }
  };

  // 处理视频结束事件
  const handleVideoEnded = () => {
    message.success('视频播放完成，请输入您的假设');
  };

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
      let userInfo = {};
      
      try {
        if (userInfoString) {
          userInfo = JSON.parse(userInfoString);
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
      
      // Prepare data for API submission
      const submissionData = {
        video_id: videoInfo.video_id,
        name: userInfo.name,
        email: userInfo.email,
        content: values.hypothesis,
        student_id: userInfo.customData?.student_id
      };
      
      try {
        // Submit hypothesis to backend
        const response = await api.post(`${API_URL}/api/propositions`, submissionData);
        
        if (response.status === 200 || response.status === 201) {
          message.success('假设提交成功');
          
          // Get the user's selection and reason from localStorage
          const selectedHypothesisId = localStorage.getItem('selected_hypothesis') || '';
          const selectionReason = localStorage.getItem('selection_reason') || '';

          // Find the selected hypothesis details
          let selectedOption;
          const currentPropsStr = localStorage.getItem('current_propositions');
          if (currentPropsStr) {
            const propositions = JSON.parse(currentPropsStr);
            selectedOption = propositions.find(p => p.id === selectedHypothesisId) || {
              label: '假设',
              content: '已选择的假设'
            };
          } else {
            selectedOption = {
              label: '假设',
              content: '已选择的假设'
            };
          }
          
          // Navigate to success page
          navigate('/annotation/success', { 
            state: { 
              userHypothesis: values.hypothesis,
              selectedHypothesis: selectedOption,
              reason: selectionReason
            } 
          });
        } else {
          throw new Error('提交失败，请重试');
        }
      } catch (error) {
        console.error('提交假设失败:', error);
        message.error('提交假设失败，请重试');
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error('表单验证失败:', error);
    }
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
            styles={{ body: { padding: '24px' } }}
          >
            <Steps
              current={1}
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
                <Card loading={true} style={{ minHeight: 10000 }} />
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
            
            {/* 右侧 - 假设输入 */}
            <Col xs={24} md={10}>
              <Card
                title="输入您的科学假设"
                variant="bordered"
                styles={{
                  header: { padding: '16px 24px' },
                  body: { padding: '16px 24px' }
                }}
                loading={videoLoading}
              >
                <Paragraph>
                  请根据视频内容，提出您认为的主要科学假设。一个好的科学假设应该是具体的、可验证的，并且与视频中的内容相关。
                </Paragraph>
                
                <Form 
                  form={form}
                  layout="vertical"
                  requiredMark={false}
                >
                  <Form.Item
                    name="hypothesis"
                    label="您的假设"
                    rules={[
                      { 
                        required: true, 
                        message: '请输入您的科学假设' 
                      },
                      {
                        min: 10,
                        message: '假设至少需要10个字符'
                      }
                    ]}
                  >
                    <TextArea
                      placeholder="请输入您的科学假设..."
                      autoSize={{ minRows: 10, maxRows: 20 }}
                      maxLength={1000}
                      showCount
                      onChange={(e) => setHypothesis(e.target.value)}
                    />
                  </Form.Item>
                  
                  <Form.Item>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      gap: '16px'
                    }}>
                      <Button 
                        size="large" 
                        onClick={handlePrevStep}
                      >
                        返回上一步
                      </Button>
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={!hypothesis.trim() || videoLoading}
                      >
                        确认提交
                      </Button>
                    </div>
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

export default AnnotationStep2;
