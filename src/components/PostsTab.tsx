import { SearchOutlined } from '@ant-design/icons';
import { Empty, Input, Pagination, Select, Spin, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../App';
import { getItemId } from '../services/api';
import { postService } from '../services/post.service';
import { userService } from '../services/user.service';
import type { Post, PostPayload } from '../types/post';
import type { User } from '../types/user';
import ImageSearchBox from './ImageSearchBox';
import PostCard from './PostCard';
import PostForm from './PostForm';

export default function PostsTab() {
  const { user } = useAuth();
  const [items, setItems] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [search, setSearch] = useState('');
  const [userId, setUserId] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [isImageSearchMode, setIsImageSearchMode] = useState(false);
  const [imageSearchFile, setImageSearchFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>();
  const [imageLoading, setImageLoading] = useState(false);

  const loadPosts = async (nextPage = page, nextLimit = limit) => {
    try {
      setLoading(true);
      const res = await postService.getPosts({ page: nextPage, limit: nextLimit, search, userId });
      setItems(res.data);
      setTotal(res.total);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không tải được bài đăng');
    } finally {
      setLoading(false);
    }
  };

  const searchByImage = async (file = imageSearchFile, nextPage = page, nextLimit = limit) => {
    if (!file) return;
    try {
      setImageLoading(true);
      setIsImageSearchMode(true);
      const res = await postService.searchPostsByImage(file, nextPage, nextLimit);
      setItems(res.data);
      setTotal(res.total);
      if (!res.data.length) message.info('Không tìm thấy bài đăng phù hợp');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Tìm kiếm ảnh thất bại');
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    if (isImageSearchMode) searchByImage(imageSearchFile, page, limit);
    else loadPosts(page, limit);
  }, [page, limit, search, userId]);

  useEffect(() => {
    if (user?.role === 'admin') {
      userService.getUsers({ page: 1, limit: 100 }).then((res) => setUsers(res.data)).catch(() => undefined);
    }
  }, [user?.role]);

  const handleSubmit = async (payload: PostPayload) => {
    try {
      setSaving(true);
      if (editing) {
        await postService.updatePost(getItemId(editing), payload);
        message.success('Cập nhật bài đăng thành công');
      } else {
        await postService.createPost(payload);
        message.success('Thêm bài đăng thành công');
      }
      setEditing(null);
      setPage(1);
      await loadPosts(1, limit);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lưu bài đăng thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await postService.deletePost(id);
      message.success('Đã xóa bài đăng');
      await loadPosts(page, limit);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa thất bại');
    }
  };

  const userOptions = useMemo(() => users.map((u) => ({ label: u.name || u.username || u.email, value: getItemId(u) })), [users]);

  return (
    <div className="two-column-layout">
      <PostForm editing={editing} loading={saving} onSubmit={handleSubmit} onCancelEdit={() => setEditing(null)} />
      <div className="list-panel">
        <ImageSearchBox
          title="Tìm bài đăng bằng hình ảnh"
          loading={imageLoading}
          previewUrl={imagePreview}
          onSearch={(file) => {
            setImageSearchFile(file);
            setImagePreview(URL.createObjectURL(file));
            setPage(1);
            searchByImage(file, 1, limit);
          }}
          onClear={() => {
            setIsImageSearchMode(false);
            setImageSearchFile(null);
            setImagePreview(undefined);
            setPage(1);
            loadPosts(1, limit);
          }}
        />
        <div className="list-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo caption, hashtag, link sản phẩm"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
              setIsImageSearchMode(false);
            }}
          />
          {user?.role === 'admin' && (
            <Select allowClear placeholder="Lọc theo user" value={userId} options={userOptions} onChange={(value) => { setUserId(value); setPage(1); }} />
          )}
        </div>
        <Spin spinning={loading || imageLoading}>
          {items.length ? (
            <div className="card-grid">
              {items.map((post) => (
                <PostCard key={getItemId(post)} post={post} onEdit={setEditing} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <Empty description="Không có bài đăng" />
          )}
        </Spin>
        <Pagination current={page} pageSize={limit} total={total} showSizeChanger pageSizeOptions={[12, 24, 48]} onChange={(p, ps) => { setPage(p); setLimit(ps); }} />
      </div>
    </div>
  );
}