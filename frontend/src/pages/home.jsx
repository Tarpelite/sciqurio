import React, { useState, useEffect } from 'react'; 
import { 
  Layout, 
  Table, 
  Card, 
  Button, 
  Typography, 
  Space,
  Divider,
  Avatar,
  Row,
  Col,
  theme,
  Spin,
  message
} from 'antd';
import { useNavigate } from 'react-router-dom'; // 添加这行
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import '@/markdown.css'
// 布局重置样式
// import './global-reset.css';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import { API_URL } from '@/config';
const { Content, Footer } = Layout;
const { Title, Text } = Typography;

// const leaderboardData = [
//   {
//     key: '1',
//     rank: 1,
//     username: 'Alice',
//     points: 1250,
//   },
//   {
//     key: '2',
//     rank: 2,
//     username: 'Bob',
//     points: 980,
//   },
//   {
//     key: '3',
//     rank: 3,
//     username: 'Charlie',
//     points: 750,
//   },
//   {
//     key: '4',
//     rank: 4,
//     username: 'David',
//     points: 620,
//   },
//   {
//     key: '5',
//     rank: 5,
//     username: 'Eve',
//     points: 510,
//   },
// ];

// 标注说明的Markdown内容
const markdownContent = `

通过标注视频科学假设，评估和改进AI的科研探究能力，构建**SciQurio Leaderboard**基准。  

---

### 标注步骤  

#### 1. 观察视频，提出假设  
- **观看视频（≥5秒）**，识别核心物理现象（如波传播、流体动力学）。  
- **提出1个原创科学假设**（需符合视频物理规律）。  

#### 2. 评估假设，选择更优者  
- **同一视频**，系统提供**两个假设**（可能来自人类或AI）。  
- **选择更合理的假设**，并简要说明理由（科学性、创新性、清晰度等）。  

---

### 关键要求  
✅ **假设质量**：  
- 必须基于视频内容。  
- 鼓励**AI4Science**角度（如"能否用GNN预测此现象？"）。  

✅ **评估标准**：  
- **科学性**（是否符合物理规律）。  
- **创新性**（是否提出新视角）。  
- **清晰度**（表述是否明确）。  

❌ **避免**：  
- 选择明显错误或无关的假设。  
- 理由过于笼统（如"这个更好"）。  


`;

export default function Home() {
  const { token } = theme.useToken();
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // 添加这行
  
  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/leaderboard`);
        // 假设API返回的数据格式为数组，包含username和points字段
        const formattedData = response.data.map((item, index) => ({
          key: index.toString(),
          rank: index + 1,
          username: item.username,
          points: item.points
        }));
        setLeaderboardData(formattedData);
        setLoading(false);
      } catch (err) {
        console.error('获取排行榜数据失败:', err);
        setError(err);
        setLoading(false);
        message.error('获取排行榜数据失败，请稍后重试');
      }
    };
    fetchLeaderboardData();
  }, []);

  // 处理开始标注按钮点击
  const handleStartAnnotation = () => {
    navigate('/annotation/step1'); // 导航到标注第一步
  };
  // 处理退出系统按钮点击
  const handleLogout = () => {
    window.location.href = 'https://sciqurio.authing.cn'; // 跳转到Authing登录页
  };

  // 列配置
  const columns = [
    {
      title: '排名',
      dataIndex: 'rank',
      key: 'rank',
      width: 80,
      align: 'center',
      render: (rank) => <Text strong>{rank}</Text>,
    },
    {
      title: '用户',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => {
        // 为每个用户生成唯一的颜色
        const getColorByName = (name) => {
          const colors = ['#1677ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1'];
          const index = name.charCodeAt(0) % colors.length;
          return colors[index];
        };
        return (
          <Space>
            {/* <Avatar style={{ backgroundColor: getColorByName(text) }}>
              {text.charAt(0).toUpperCase()}
            </Avatar> */}
            <Text>{text}</Text>
          </Space>
        );
      },
    },
    {
      title: '标注完成数',
      dataIndex: 'points',
      key: 'points',
      align: 'center',
      render: (points) => (
        <Text type="success" strong>{points.toLocaleString()}</Text>
      ),
    },
  ];
  return (
    <Layout style={{ minHeight: '100vh', width: '100%' }}>
      <AppHeader />
      
      <Content style={{ width: '100%', background: '#f0f2f5' }}>
        <div style={{ 
          padding: '16px 24px',  // 减小内边距
          width: '100%', 
          background: '#f0f2f5',
          paddingTop: '16px' // 添加顶部内边距
        }}>
          {/* 使用Grid系统布局 */}
          <Row gutter={[24, 24]} style={{ width: '100%', margin: 0 }}>
            {/* 主内容区 - 排行榜表格 */}
            <Col xs={24} md={8}>
              <Card 
                title="标注排行榜" 
                variant="bordered"
                styles={{
                  header: { padding: '16px 24px' },
                  body: { padding: 0 }
                }}
              >
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <Spin tip="加载排行榜数据中..." />
                  </div>
                ) : error ? (
                  <div style={{ textAlign: 'center', padding: '24px' }}>
                    <Text type="danger">加载排行榜数据失败</Text>
                  </div>
                ) : (
                  <Table
                    columns={columns}
                    dataSource={leaderboardData}
                    pagination={false}
                    size="middle"
                    scroll={{ x: 'max-content' }}
                  />
                )}
              </Card>
            </Col>
            
            {/* 侧边栏 - 标注说明 */}
            <Col xs={24} md={16}>
              <Card 
                title="标注说明"
                variant="bordered"
                styles={{
                  header: { padding: '16px 24px' },
                  body: { padding: '16px 24px' }
                }}
              >
                <div className="markdown-content" style={{ 
                  lineHeight: 1.8,
                  fontSize: '14px'
                }}>
                  <ReactMarkdown>{markdownContent}</ReactMarkdown>
                </div>
              </Card>
            </Col>
          </Row>
          {/* 底部按钮 */}
          <Divider style={{ margin: '16px 0' }} />
          <Row justify="center" style={{ marginBottom: '16px' }}>
            <Space size="large">
              <Button type="primary" size="large" style={{ minWidth: 150 }} onClick={handleStartAnnotation}>
                开始标注
              </Button>
              <Button size="large" style={{ minWidth: 150 }} onClick={handleLogout}>
                退出系统
              </Button>
            </Space>
          </Row>
        </div>
      </Content>
    <AppFooter />
    </Layout>
  );
}