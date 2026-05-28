import { CopyOutlined, DeleteOutlined, EditOutlined, EyeOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { Button, Descriptions, Modal, Popconfirm, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
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

  const detailLine = (content: ReactNode, copyText?: string | number | boolean, label = 'Nội dung') => (
    <div className="detail-line">
      <div className="detail-value">{content}</div>
      <div className="detail-actions">{copyButton(copyText, label)}</div>
    </div>
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
    { title: 'CCCD/CMND', dataIndex: 'citizenId', render: (value) => value || '-' },
    { title: 'SĐT', dataIndex: 'phone', render: (value) => value || '-' },
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
              `Email: ${detailUser.email || ''}`,
              `Tên: ${detailUser.name || detailUser.username || ''}`,
              `CCCD/CMND: ${detailUser.citizenId || ''}`,
              `SĐT: ${detailUser.phone || ''}`,
              `Địa chỉ: ${detailUser.address || ''}`,
              `Trang được xem: ${(detailUser.viewablePages || []).join(', ')}`,
              `Trang được sửa: ${(detailUser.editablePages || []).join(', ')}`,
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
            <Descriptions.Item label="Email">
              {detailLine(<Text>{detailUser.email || '-'}</Text>, detailUser.email, 'email')}
            </Descriptions.Item>
            <Descriptions.Item label="Tên">
              {detailLine(<Text>{detailUser.name || detailUser.username || '-'}</Text>, detailUser.name || detailUser.username, 'tên')}
            </Descriptions.Item>
            <Descriptions.Item label="Username">
              {detailLine(<Text>{detailUser.username || '-'}</Text>, detailUser.username, 'username')}
            </Descriptions.Item>
            <Descriptions.Item label="CCCD/CMND">
              {detailLine(<Text>{detailUser.citizenId || '-'}</Text>, detailUser.citizenId, 'CCCD/CMND')}
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {detailLine(<Text>{detailUser.phone || '-'}</Text>, detailUser.phone, 'số điện thoại')}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {detailLine(<Text>{detailUser.address || '-'}</Text>, detailUser.address, 'địa chỉ')}
            </Descriptions.Item>
            <Descriptions.Item label="Trang được xem">
              {detailLine(
                <Space wrap>{(detailUser.viewablePages || []).map((page) => <Tag key={page}>{page}</Tag>)}</Space>,
                (detailUser.viewablePages || []).join(', '),
                'trang được xem',
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Trang được sửa">
              {detailLine(
                <Space wrap>{(detailUser.editablePages || []).map((page) => <Tag key={page} color="blue">{page}</Tag>)}</Space>,
                (detailUser.editablePages || []).join(', '),
                'trang được sửa',
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Role">
              {detailLine(<Tag color={detailUser.role === 'admin' ? 'cyan' : 'green'}>{detailUser.role}</Tag>, detailUser.role, 'role')}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {detailLine(<Tag color={detailActive ? 'success' : 'error'}>{detailActive ? 'active' : 'inactive'}</Tag>, detailActive ? 'active' : 'inactive', 'trạng thái')}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{detailUser.createdAt ? dayjs(detailUser.createdAt).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
            <Descriptions.Item label="Cập nhật">{detailUser.updatedAt ? dayjs(detailUser.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </>
  );
}