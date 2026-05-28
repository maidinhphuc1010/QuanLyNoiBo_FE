import { Button, Form, Input, Select, Space, Switch } from 'antd';
import { useEffect } from 'react';
import type { User, UserPayload } from '../types/user';

interface UserFormProps {
  editing?: User | null;
  loading?: boolean;
  onSubmit: (payload: UserPayload) => Promise<void>;
  onCancelEdit: () => void;
}

export default function UserForm({ editing, loading, onSubmit, onCancelEdit }: UserFormProps) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        email: editing.email,
        name: editing.name || editing.username,
        role: editing.role,
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
      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ role: 'user', isActive: true }}>
        <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email' }, { type: 'email', message: 'Email không hợp lệ' }]}>
          <Input placeholder="user@example.com" />
        </Form.Item>
        <Form.Item name="password" label={editing ? 'Password mới (bỏ trống nếu không đổi)' : 'Password'} rules={editing ? [] : [{ required: true, message: 'Nhập password' }]}>
          <Input.Password placeholder="••••••••" />
        </Form.Item>
        <Form.Item name="name" label="Tên người dùng">
          <Input placeholder="Tên hiển thị" />
        </Form.Item>
        <Form.Item name="role" label="Role" rules={[{ required: true }]}>
          <Select options={[{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }]} />
        </Form.Item>
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