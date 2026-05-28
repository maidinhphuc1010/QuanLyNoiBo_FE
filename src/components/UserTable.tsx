import { CopyOutlined, DeleteOutlined, EditOutlined, EyeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { Button, Descriptions, Modal, Popconfirm, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useState } from 'react';
import { getItemId } from '../services/api';
import type { User } from '../types/user';

interface UserTableProps {
  users: User[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  currentUserId: string;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onPageChange: (page: number, pageSize: number) => void;
}

const { Text } = Typography;

export default function UserTable({ users, loading, total, page, limit, currentUserId, onEdit, onDelete, onToggle, onPageChange }: UserTableProps) {
  const [detailUser, setDetailUser] = useState<User | null>(null);

  const copy = async (text?: string | number | boolean, label = 'Nội dung') => {
    if (text === undefined || text === null || text === '') return message.warning('Không có nội dung để copy');
    await navigator.clipboard.writeText(String(text));
    message.success(`Đã copy ${label}`);
  };

  const copyButton = (text?: string | number | boolean, label = 'Nội dung') => (
    <Button size="small" icon={<CopyOutlined />} onClick={() => copy(text, label)}>
      Copy
    </Button>
  );

  const getUserActive = (user: User) => (user.status ? user.status === 'active' : user.isActive !== false);

  const columns: ColumnsType<User> = [
    {
      title: 'Email',
      dataIndex: 'email',
      render: (email, record) => (
        <Space>
          <Typography.Link onClick={(event) => {
            event.stopPropagation();
            setDetailUser(record);
          }}>
            {email}
          </Typography.Link>
          <Button
            size="small"
            type="text"
            icon={<CopyOutlined />}
            onClick={(event) => {
              event.stopPropagation();
              copy(email, 'email');
            }}
          />
        </Space>
      ),
    },
    { title: 'Tên', render: (_, record) => record.name || record.username || '-' },
    { title: 'Role', dataIndex: 'role', render: (role) => <Tag color={role === 'admin' ? 'cyan' : 'green'}>{role}</Tag> },
    {
      title: 'Trạng thái',
      render: (_, record) => {
        const active = getUserActive(record);
        return <Tag color={active ? 'success' : 'error'}>{active ? 'active' : 'inactive'}</Tag>;
      },
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', render: (value) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-') },
    {
      title: 'Hành động',
      render: (_, record) => {
        const id = getItemId(record);
        const isSelf = id === currentUserId;
        const active = getUserActive(record);
        return (
          <Space wrap onClick={(event) => event.stopPropagation()}>
            <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailUser(record)}>
              Chi tiết
            </Button>
            <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(record)}>Sửa</Button>
            <Popconfirm title={active ? 'Khóa user này?' : 'Mở khóa user này?'} onConfirm={() => onToggle(id)} disabled={isSelf}>
              <Button size="small" icon={active ? <LockOutlined /> : <UnlockOutlined />} disabled={isSelf}>{active ? 'Khóa' : 'Mở khóa'}</Button>
            </Popconfirm>
            <Popconfirm title="Xóa user này?" onConfirm={() => onDelete(id)} disabled={isSelf}>
              <Button danger size="small" icon={<DeleteOutlined />} disabled={isSelf}>Xóa</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const detailId = detailUser ? getItemId(detailUser) : '';
  const detailActive = detailUser ? getUserActive(detailUser) : false;

  return (
    <>
      <Table
        rowKey={(record) => getItemId(record)}
        columns={columns}
        dataSource={users}
        loading={loading}
        scroll={{ x: 860 }}
        onRow={(record) => ({
          onClick: () => setDetailUser(record),
          className: 'clickable-row',
        })}
        pagination={{
          current: page,
          pageSize: limit,
          total,
          showSizeChanger: true,
          pageSizeOptions: [10, 20, 50],
          onChange: onPageChange,
        }}
      />

      <Modal
        title="Chi tiết người dùng"
        open={!!detailUser}
        onCancel={() => setDetailUser(null)}
        footer={detailUser ? [
          <Button
            key="copy-all"
            icon={<CopyOutlined />}
            onClick={() => copy([
              `ID: ${detailId}`,
              `Email: ${detailUser.email || ''}`,
              `Tên: ${detailUser.name || detailUser.username || ''}`,
              `Role: ${detailUser.role || ''}`,
              `Trạng thái: ${detailActive ? 'active' : 'inactive'}`,
            ].join('\n'), 'thông tin người dùng')}
          >
            Copy tất cả
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              onEdit(detailUser);
              setDetailUser(null);
            }}
          >
            Sửa
          </Button>,
        ] : null}
      >
        {detailUser && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">
              <Space>
                <Text code>{detailId}</Text>
                {copyButton(detailId, 'ID')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <Space direction="vertical" className="w-100">
                <Text>{detailUser.email || '-'}</Text>
                {copyButton(detailUser.email, 'email')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Tên">
              <Space direction="vertical" className="w-100">
                <Text>{detailUser.name || detailUser.username || '-'}</Text>
                {copyButton(detailUser.name || detailUser.username, 'tên')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Username">
              <Space direction="vertical" className="w-100">
                <Text>{detailUser.username || '-'}</Text>
                {copyButton(detailUser.username, 'username')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              <Space>
                <Tag color={detailUser.role === 'admin' ? 'cyan' : 'green'}>{detailUser.role}</Tag>
                {copyButton(detailUser.role, 'role')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Space>
                <Tag color={detailActive ? 'success' : 'error'}>{detailActive ? 'active' : 'inactive'}</Tag>
                {copyButton(detailActive ? 'active' : 'inactive', 'trạng thái')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{detailUser.createdAt ? dayjs(detailUser.createdAt).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
            <Descriptions.Item label="Cập nhật">{detailUser.updatedAt ? dayjs(detailUser.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
}