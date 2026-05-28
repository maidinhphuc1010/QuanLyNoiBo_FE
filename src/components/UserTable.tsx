import { Button, Popconfirm, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
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

export default function UserTable({ users, loading, total, page, limit, currentUserId, onEdit, onDelete, onToggle, onPageChange }: UserTableProps) {
  const columns: ColumnsType<User> = [
    { title: 'Email', dataIndex: 'email' },
    { title: 'Tên', render: (_, record) => record.name || record.username || '-' },
    { title: 'Role', dataIndex: 'role', render: (role) => <Tag color={role === 'admin' ? 'cyan' : 'green'}>{role}</Tag> },
    {
      title: 'Trạng thái',
      render: (_, record) => {
        const active = record.status ? record.status === 'active' : record.isActive !== false;
        return <Tag color={active ? 'success' : 'error'}>{active ? 'active' : 'inactive'}</Tag>;
      },
    },
    { title: 'Ngày tạo', dataIndex: 'createdAt', render: (value) => (value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '-') },
    {
      title: 'Hành động',
      render: (_, record) => {
        const id = getItemId(record);
        const isSelf = id === currentUserId;
        const active = record.status ? record.status === 'active' : record.isActive !== false;
        return (
          <Space wrap>
            <Button size="small" onClick={() => onEdit(record)}>Sửa</Button>
            <Popconfirm title={active ? 'Khóa user này?' : 'Mở khóa user này?'} onConfirm={() => onToggle(id)} disabled={isSelf}>
              <Button size="small" disabled={isSelf}>{active ? 'Khóa' : 'Mở khóa'}</Button>
            </Popconfirm>
            <Popconfirm title="Xóa user này?" onConfirm={() => onDelete(id)} disabled={isSelf}>
              <Button danger size="small" disabled={isSelf}>Xóa</Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <Table
      rowKey={(record) => getItemId(record)}
      columns={columns}
      dataSource={users}
      loading={loading}
      scroll={{ x: 860 }}
      pagination={{
        current: page,
        pageSize: limit,
        total,
        showSizeChanger: true,
        pageSizeOptions: [10, 20, 50],
        onChange: onPageChange,
      }}
    />
  );
}