import { SearchOutlined } from '@ant-design/icons';
import { Input, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { getItemId } from '../services/api';
import { userService } from '../services/user.service';
import type { User, UserPayload } from '../types/user';
import UserForm from './UserForm';
import UserTable from './UserTable';

export default function UsersTab() {
  const { user } = useAuth();
  const [items, setItems] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadUsers = async (nextPage = page, nextLimit = limit) => {
    try {
      setLoading(true);
      const res = await userService.getUsers({ page: nextPage, limit: nextLimit, search, role, status });
      setItems(res.data);
      setTotal(res.total);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không tải được users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(page, limit);
  }, [page, limit, search, role, status]);

  const handleSubmit = async (payload: UserPayload) => {
    try {
      setSaving(true);
      if (editing) {
        await userService.updateUser(getItemId(editing), payload);
        message.success('Cập nhật user thành công');
      } else {
        await userService.createUser(payload);
        message.success('Thêm user thành công');
      }
      setEditing(null);
      setPage(1);
      await loadUsers(1, limit);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lưu user thất bại');
    } finally {
      setSaving(false);
    }
  };

  const currentUserId = getItemId(user || { id: '' });

  const handleDelete = async (id: string) => {
    if (id === currentUserId) return message.warning('Không thể xóa chính tài khoản đang đăng nhập');
    try {
      await userService.deleteUser(id);
      message.success('Đã xóa user');
      await loadUsers(page, limit);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa user thất bại');
    }
  };

  const handleToggle = async (id: string) => {
    if (id === currentUserId) return message.warning('Không thể khóa chính tài khoản đang đăng nhập');
    try {
      await userService.toggleActive(id);
      message.success('Cập nhật trạng thái thành công');
      await loadUsers(page, limit);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Cập nhật trạng thái thất bại');
    }
  };

  return (
    <div className="two-column-layout">
      <UserForm editing={editing} loading={saving} onSubmit={handleSubmit} onCancelEdit={() => setEditing(null)} />
      <div className="list-panel">
        <div className="list-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo email hoặc tên"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Select allowClear placeholder="Role" value={role} onChange={(value) => { setRole(value); setPage(1); }} options={[{ label: 'Admin', value: 'admin' }, { label: 'User', value: 'user' }]} />
          <Select allowClear placeholder="Trạng thái" value={status} onChange={(value) => { setStatus(value); setPage(1); }} options={[{ label: 'Active', value: 'active' }, { label: 'Inactive', value: 'inactive' }]} />
        </div>
        <UserTable
          users={items}
          loading={loading}
          total={total}
          page={page}
          limit={limit}
          currentUserId={currentUserId}
          onEdit={setEditing}
          onDelete={handleDelete}
          onToggle={handleToggle}
          onPageChange={(p, ps) => {
            setPage(p);
            setLimit(ps);
          }}
        />
      </div>
    </div>
  );
}