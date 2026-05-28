import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Layout, Space, Tag, Typography } from 'antd';
import { useAuth } from '../App';

const { Header, Content } = Layout;
const { Text } = Typography;

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <div className="app-title">
          <img className="brand-logo small" src="/Logo.png" alt="Content Storage" />
          <span>Content Storage</span>
        </div>
        <Space size="middle" wrap>
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div className="header-user">
              <Text strong>{user?.name || user?.username || user?.email}</Text>
              <Tag color={user?.role === 'admin' ? 'cyan' : 'green'}>{user?.role}</Tag>
            </div>
          </Space>
          <Button icon={<LogoutOutlined />} onClick={logout}>
            Logout
          </Button>
        </Space>
      </Header>
      <Content className="app-content">{children}</Content>
    </Layout>
  );
}