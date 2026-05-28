import { CopyOutlined, DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Card, Empty, Image, Popconfirm, Space, Tag, Tooltip, Typography, message } from 'antd';
import { getItemId } from '../services/api';
import type { Product } from '../types/product';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

const { Text, Paragraph } = Typography;

export function formatVND(value?: number | string) {
  if (value === undefined || value === null || value === '') return 'Chưa nhập giá';
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return String(value);
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numberValue);
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const images = product.images || product.media || [];
  const cover = images[0];
  const id = getItemId(product);

  const copy = async (text?: string, label = 'Nội dung') => {
    if (!text) return message.warning('Không có nội dung để copy');
    await navigator.clipboard.writeText(text);
    message.success(`Đã copy ${label}`);
  };

  return (
    <Card
      className="storage-card"
      cover={cover ? <Image className="card-cover" src={cover} alt={product.name} preview={false} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có ảnh" />}
      actions={[
        <Tooltip title="Copy link" key="copy">
          <Button type="text" icon={<CopyOutlined />} onClick={() => copy(product.link, 'link')} />
        </Tooltip>,
        <Tooltip title="Sửa" key="edit">
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(product)} />
        </Tooltip>,
        <Popconfirm key="delete" title="Xóa sản phẩm?" okText="Xóa" cancelText="Hủy" onConfirm={() => onDelete(id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ]}
    >
      <Space direction="vertical" size={6} className="w-100">
        {product.similarity !== undefined && <Tag color="cyan">Độ giống: {Math.round(Number(product.similarity) * (Number(product.similarity) <= 1 ? 100 : 1))}%</Tag>}
        <Text strong ellipsis title={product.name}>
          {product.name}
        </Text>
        <Tag color={product.price ? 'green' : 'default'}>{formatVND(product.price)}</Tag>
        {product.link && (
          <Paragraph className="card-link" copyable={{ text: product.link }} ellipsis={{ rows: 1 }}>
            <LinkOutlined /> {product.link}
          </Paragraph>
        )}
        {product.note && <Paragraph ellipsis={{ rows: 2 }}>{product.note}</Paragraph>}
      </Space>
    </Card>
  );
}