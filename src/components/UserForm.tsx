import { Button, Form, Input, Select, Space, Switch, Typography } from 'antd';
import { useEffect } from 'react';
import type { User, UserPayload } from '../types/user';

interface UserFormProps {
  editing?: User | null;
  loading?: boolean;
  onSubmit: (payload: UserPayload) => Promise<void>;
  onCancelEdit: () => void;
}

const pageOptions = [
  { label: 'Kho sản phẩm', value: 'products' },
  { label: 'Bài viết', value: 'posts' },
  { label: 'Thống kê', value: 'statistics' },
  { label: 'Quản lý user', value: 'users' },
];

export default function UserForm({ editing, loading, onSubmit, onCancelEdit }: UserFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        email: editing.email,
        name: editing.name || editing.username,
        phone: editing.phone,
        address: editing.address,
        citizenId: editing.citizenId,
        role: editing.role,
        viewablePages: editing.viewablePages || [],
        editablePages: editing.editablePages || [],
        isActive: editing.status ? editing.status === 'active' : editing.isActive !== false,
      });
    } else {
      form.resetFields();
    }
  }, [editing, form]);

  const handleFinish = async (values: any) => {
    const payload: UserPayload = {
      email: values.email,
      name: values.name,
      username: values.name,
      role: values.role,
      citizenId: values.citizenId,
      phone: values.phone,
      address: values.address,
      viewablePages: values.viewablePages || [],
      editablePages: values.editablePages || [],
      isActive: values.isActive,
      status: values.isActive ? 'active' : 'inactive',
    };
    if (values.password) payload.password = values.password;
    await onSubmit(payload);
    if (!editing) form.resetFields();
  };

  return (
    <div className="form-panel">
      <h3>{editing ? 'Cập nhật user' : 'Thêm user'}</h3>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        initialValues={{ role: 'user', isActive: true, viewablePages: ['products', 'posts'], editablePages: [] }}
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}
        >
          <Input placeholder="user@example.com" />
        </Form.Item>

        <Form.Item
          name="citizenId"
          label="CCCD/CMND"
          rules={[
            { required: true, message: 'Nhập CCCD/CMND' },
            { min: 9, message: 'CCCD/CMND tối thiểu 9 ký tự' },
          ]}
          extra={!editing ? 'Nếu không nhập password, backend sẽ dùng CCCD/CMND làm mật khẩu mặc định.' : undefined}
        >
          <Input placeholder="012345678901" />
        </Form.Item>

        <Form.Item name="password" label={editing ? 'Password mới (bỏ trống nếu không đổi)' : 'Password'}>
          <Input.Password placeholder={!editing ? 'Bỏ trống để dùng CCCD/CMND' : '••••••••'} />
        </Form.Item>

        <Form.Item name="name" label="Tên người dùng">
          <Input placeholder="Tên hiển thị" />
        </Form.Item>

        <Form.Item name="phone" label="Số điện thoại">
          <Input placeholder="Số điện thoại" />
        </Form.Item>

        <Form.Item name="address" label="Địa chỉ">
          <Input.TextArea rows={3} placeholder="Địa chỉ" />
        </Form.Item>

        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select options={[{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }]} />
        </Form.Item>

        <Form.Item name="viewablePages" label="Trang được xem">
          <Select mode="multiple" allowClear placeholder="Chọn trang được xem" options={pageOptions} />
        </Form.Item>

        <Form.Item name="editablePages" label="Trang được chỉnh sửa">
          <Select mode="multiple" allowClear placeholder="Chọn trang được chỉnh sửa" options={pageOptions} />
        </Form.Item>

        <Typography.Paragraph type="secondary" className="form-hint">
          Quyền chỉnh sửa nên nằm trong các trang được xem để user có thể truy cập trang trước khi thao tác.
        </Typography.Paragraph>

        <Form.Item name="isActive" label="Trạng thái" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
        </Form.Item>

        <Space wrap>
          <Button type="primary" htmlType="submit" loading={loading}>
            {editing ? 'Cập nhật user' : 'Thêm user'}
          </Button>
          <Button onClick={onCancelEdit}>{editing ? 'Hủy sửa' : 'Làm mới'}</Button>
        </Space>
      </Form>
    </div>
  );
}