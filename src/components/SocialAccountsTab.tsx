import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, Pagination, Popconfirm, Select, Space, Spin, Table, Tag, message } from 'antd';
import { useEffect, useState } from 'react';
import { getItemId } from '../services/api';
import { socialAccountService } from '../services/social-account.service';
import type { SocialAccount, SocialAccountPayload } from '../types/social-account';

const platformOptions = [
  { label: 'Facebook', value: 'Facebook' },
  { label: 'TikTok', value: 'TikTok' },
  { label: 'Instagram', value: 'Instagram' },
  { label: 'YouTube', value: 'YouTube' },
  { label: 'Zalo', value: 'Zalo' },
  { label: 'Shopee', value: 'Shopee' },
  { label: 'Lazada', value: 'Lazada' },
  { label: 'Khác', value: 'Khác' },
];

export default function SocialAccountsTab() {
  const [form] = Form.useForm();
  const [items, setItems] = useState<SocialAccount[]>([]);
  const [editing, setEditing] = useState<SocialAccount | null>(null);
  const [search, setSearch] = useState('');
  const [platform, setPlatform] = useState<string | undefined>();
  const [isActive, setIsActive] = useState<boolean | undefined>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadAccounts = async (nextPage = page, nextLimit = limit) => {
    try {
      setLoading(true);
      const res = await socialAccountService.getSocialAccounts({
        page: nextPage,
        limit: nextLimit,
        search,
        platform,
        isActive,
      });
      setItems(res.data);
      setTotal(res.total);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không tải được danh sách tài khoản/nền tảng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts(page, limit);
  }, [page, limit, search, platform, isActive]);

  const resetForm = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ isActive: true });
  };

  const handleSubmit = async (values: SocialAccountPayload) => {
    try {
      setSaving(true);
      const payload: SocialAccountPayload = {
        platform: values.platform,
        name: values.name,
        username: values.username,
        url: values.url,
        isActive: values.isActive,
        note: values.note,
      };

      if (editing) {
        await socialAccountService.updateSocialAccount(getItemId(editing), payload);
        message.success('Cập nhật tài khoản/nền tảng thành công');
      } else {
        await socialAccountService.createSocialAccount(payload);
        message.success('Thêm tài khoản/nền tảng thành công');
      }

      resetForm();
      setPage(1);
      await loadAccounts(1, limit);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lưu tài khoản/nền tảng thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (account: SocialAccount) => {
    setEditing(account);
    form.setFieldsValue({
      platform: account.platform,
      name: account.name,
      username: account.username,
      url: account.url,
      isActive: account.isActive !== false,
      note: account.note,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await socialAccountService.deleteSocialAccount(id);
      message.success('Đã xóa tài khoản/nền tảng');
      await loadAccounts(page, limit);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa tài khoản/nền tảng thất bại');
    }
  };

  return (
    <div className="two-column-layout">
      <div className="form-panel">
        <h3>{editing ? 'Cập nhật tài khoản/nền tảng' : 'Thêm tài khoản/nền tảng'}</h3>
        <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ isActive: true }}>
          <Form.Item name="platform" label="Nền tảng" rules={[{ required: true, message: 'Vui lòng chọn nền tảng' }]}>
            <Select showSearch options={platformOptions} placeholder="Chọn nền tảng" />
          </Form.Item>
          <Form.Item name="name" label="Tên tài khoản" rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản' }]}>
            <Input placeholder="VD: Fanpage Kho Sản Phẩm" />
          </Form.Item>
          <Form.Item name="username" label="Username/ID">
            <Input placeholder="VD: @khosanpham" />
          </Form.Item>
          <Form.Item name="url" label="Link tài khoản">
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea rows={3} placeholder="Ghi chú nội bộ" />
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>Đang sử dụng</Checkbox>
          </Form.Item>
          <Space wrap>
            <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={saving}>
              {editing ? 'Cập nhật' : 'Thêm mới'}
            </Button>
            <Button onClick={resetForm}>{editing ? 'Hủy sửa' : 'Làm mới'}</Button>
          </Space>
        </Form>
      </div>

      <div className="list-panel">
        <div className="list-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên, username, ghi chú"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder="Lọc nền tảng"
            value={platform}
            options={platformOptions}
            onChange={(value) => {
              setPlatform(value);
              setPage(1);
            }}
          />
          <Select
            allowClear
            placeholder="Trạng thái"
            value={isActive}
            options={[
              { label: 'Đang sử dụng', value: true },
              { label: 'Tạm ẩn', value: false },
            ]}
            onChange={(value) => {
              setIsActive(value);
              setPage(1);
            }}
          />
        </div>

        <Spin spinning={loading}>
          <Table
            rowKey={(record) => getItemId(record)}
            dataSource={items}
            pagination={false}
            columns={[
              {
                title: 'Nền tảng',
                dataIndex: 'platform',
                render: (value: string) => <Tag color="blue">{value}</Tag>,
              },
              {
                title: 'Tài khoản',
                render: (_, record) => (
                  <Space direction="vertical" size={0}>
                    <strong>{record.name}</strong>
                    {record.username && <span>{record.username}</span>}
                    {record.url && (
                      <a href={record.url} target="_blank" rel="noreferrer">
                        {record.url}
                      </a>
                    )}
                  </Space>
                ),
              },
              {
                title: 'Trạng thái',
                dataIndex: 'isActive',
                render: (value: boolean | undefined) => (
                  <Tag color={value === false ? 'default' : 'green'}>{value === false ? 'Tạm ẩn' : 'Đang sử dụng'}</Tag>
                ),
              },
              {
                title: 'Ghi chú',
                dataIndex: 'note',
                ellipsis: true,
              },
              {
                title: 'Thao tác',
                width: 140,
                render: (_, record) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
                      Sửa
                    </Button>
                    <Popconfirm
                      title="Xóa tài khoản/nền tảng?"
                      okText="Xóa"
                      cancelText="Hủy"
                      onConfirm={() => handleDelete(getItemId(record))}
                    >
                      <Button size="small" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </Space>
                ),
              },
            ]}
          />
        </Spin>

        <Pagination
          current={page}
          pageSize={limit}
          total={total}
          showSizeChanger
          pageSizeOptions={[10, 20, 50]}
          onChange={(nextPage, nextLimit) => {
            setPage(nextPage);
            setLimit(nextLimit);
          }}
        />
      </div>
    </div>
  );
}