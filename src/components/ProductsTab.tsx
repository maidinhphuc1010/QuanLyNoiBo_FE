import { SearchOutlined } from '@ant-design/icons';
import { Empty, Input, Pagination, Select, Spin, message } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../App';
import { getItemId } from '../services/api';
import { productService } from '../services/product.service';
import { userService } from '../services/user.service';
import type { Product, ProductPayload } from '../types/product';
import type { User } from '../types/user';
import ImageSearchBox from './ImageSearchBox';
import ProductCard from './ProductCard';
import ProductForm from './ProductForm';

export default function ProductsTab() {
  const { user } = useAuth();
  const [items, setItems] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
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

  const loadProducts = async (nextPage = page, nextLimit = limit) => {
    try {
      setLoading(true);
      const res = await productService.getProducts({ page: nextPage, limit: nextLimit, search, userId });
      setItems(res.data);
      setTotal(res.total);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Không tải được sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const searchByImage = async (file = imageSearchFile, nextPage = page, nextLimit = limit) => {
    if (!file) return;
    try {
      setImageLoading(true);
      setIsImageSearchMode(true);
      const res = await productService.searchProductsByImage(file, nextPage, nextLimit);
      setItems(res.data);
      setTotal(res.total);
      if (!res.data.length) message.info('Không tìm thấy sản phẩm phù hợp');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Tìm kiếm ảnh thất bại');
    } finally {
      setImageLoading(false);
    }
  };

  useEffect(() => {
    if (isImageSearchMode) searchByImage(imageSearchFile, page, limit);
    else loadProducts(page, limit);
  }, [page, limit, search, userId]);

  useEffect(() => {
    if (user?.role === 'admin') {
      userService.getUsers({ page: 1, limit: 100 }).then((res) => setUsers(res.data)).catch(() => undefined);
    }
  }, [user?.role]);

  const handleSubmit = async (payload: ProductPayload) => {
    try {
      setSaving(true);
      if (editing) {
        await productService.updateProduct(getItemId(editing), payload);
        message.success('Cập nhật sản phẩm thành công');
      } else {
        await productService.createProduct(payload);
        message.success('Thêm sản phẩm thành công');
      }
      setEditing(null);
      await loadProducts(1, limit);
      setPage(1);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Lưu sản phẩm thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await productService.deleteProduct(id);
      message.success('Đã xóa sản phẩm');
      await loadProducts(page, limit);
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Xóa thất bại');
    }
  };

  const userOptions = useMemo(() => users.map((u) => ({ label: u.name || u.username || u.email, value: getItemId(u) })), [users]);

  return (
    <div className="two-column-layout">
      <ProductForm editing={editing} loading={saving} onSubmit={handleSubmit} onCancelEdit={() => setEditing(null)} />
      <div className="list-panel">
        <ImageSearchBox
          title="Tìm sản phẩm bằng hình ảnh"
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
            loadProducts(1, limit);
          }}
        />
        <div className="list-toolbar">
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm theo tên, giá hoặc link"
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
              {items.map((product) => (
                <ProductCard key={getItemId(product)} product={product} onEdit={setEditing} onDelete={handleDelete} />
              ))}
            </div>
          ) : (
            <Empty description="Không có sản phẩm" />
          )}
        </Spin>
        <Pagination current={page} pageSize={limit} total={total} showSizeChanger pageSizeOptions={[12, 24, 48]} onChange={(p, ps) => { setPage(p); setLimit(ps); }} />
      </div>
    </div>
  );
}