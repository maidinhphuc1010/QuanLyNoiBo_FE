import { AppstoreOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons';
import { Card, Tabs } from 'antd';
import { useMemo } from 'react';
import { useAuth } from '../App';
import AppLayout from '../components/AppLayout';
import ProductsTab from '../components/ProductsTab';
import PostsTab from '../components/PostsTab';
import UsersTab from '../components/UsersTab';

export default function DashboardPage() {
  const { user } = useAuth();

  const items = useMemo(
    () => [
      {
        key: 'products',
        label: (
          <span>
            <AppstoreOutlined /> Kho sản phẩm
          </span>
        ),
        children: <ProductsTab />,
      },
      {
        key: 'posts',
        label: (
          <span>
            <FileTextOutlined /> Kho bài đăng
          </span>
        ),
        children: <PostsTab />,
      },
      ...(user?.role === 'admin'
        ? [
            {
              key: 'users',
              label: (
                <span>
                  <TeamOutlined /> Quản lý người dùng
                </span>
              ),
              children: <UsersTab />,
            },
          ]
        : []),
    ],
    [user?.role],
  );

  return (
    <AppLayout>
      <Card className="dashboard-card">
        <Tabs defaultActiveKey="products" items={items} />
      </Card>
    </AppLayout>
  );
}