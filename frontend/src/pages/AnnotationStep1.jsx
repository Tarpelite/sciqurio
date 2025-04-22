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
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import { API_URL } from '@/config';
import { api } from '../utils/api';

const { Content, Footer } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AnnotationStep1 = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [hypothesis, setHypothesis] = useState('');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState({
    src: '',
    title: '',
    description: '',
    video_id: ''
  });
  const [videoLoading, setVideoLoading] = useState(true);

  // Fetch video info when component mounts
  useEffect(() => {
    const fetchVideoInfo = async () => {
      try {
        const response = await api.get(`${API_URL}/api/random_video`);
        
        if (response.status !== 200) {
          throw new Error('Failed to fetch video data');
        }
        
        // Store video_id in localStorage for persistence
        localStorage.setItem('current_video_id', response.data.video_id);
        
        setVideoInfo({
          src: `${API_URL}/${response.data.storage_path}`,
          title: response.data.dataset,
          description: response.data.description,
          video_id: response.data.video_id
        });
      } catch (error) {
        console.error('Error fetching video data:', error);
        message.error('Failed to load video data');
        // Fallback to default video info
        setVideoInfo({
          src: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
          title: '科学文献标注示例视频',
          description: '本视频将介绍如何对科学文献中的假设进行标注，请观看后在下方输入您认为的主要科学假设。',
          video_id: 'default_video_id'
        });
      } finally {
        setVideoLoading(false);
      }
    };

    fetchVideoInfo();
  }, []);

  // 处理视频结束事件
  const handleVideoEnded = () => {
    message.success('视频播放完成，请输入您的假设');
  };

  // 处理下一步
  const handleNextStep = async () => {
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
        student_id: userInfo.customData.student_id
      };
      
      try {
        // Submit hypothesis to backend
        const response = await api.post(`${API_URL}/api/propositions`, submissionData);
        
        if (response.status === 200 || response.status === 201) {
          message.success('假设提交成功');
          
          // Navigate to next step with complete video information
          navigate('/annotation/step2', { 
            state: { 
              userHypothesis: values.hypothesis,
              videoId: videoInfo.video_id,
              videoInfo: {
                src: videoInfo.src,
                title: videoInfo.title,
                description: videoInfo.description
              }
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
    <App> {/* Wrap the entire component in App */}
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
              style={{ marginBottom: '24px', bodyStyle: { padding: 0 } }}
            >
              <Steps
                current={0}
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
                {videoLoading ? (
                  <Card loading={true} />
                ) : (
                  <VideoPlayer
                    src={videoInfo.src}
                    title={videoInfo.title}
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
                    body: { padding: '16px 24px' } // Updated to use styles.body
                  }}
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
                        autoSize={{ minRows: 4, maxRows: 8 }}
                        maxLength={500}
                        showCount
                        onChange={(e) => setHypothesis(e.target.value)}
                      />
                    </Form.Item>
                    
                    <Form.Item>
                      <Button
                        type="primary"
                        size="large"
                        onClick={handleNextStep}
                        loading={loading}
                        disabled={!hypothesis.trim() || videoLoading}
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

        <AppFooter />
      </Layout>
    </App>
  );
};

export default AnnotationStep1;
