import { CopyOutlined, DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Empty, Image, Modal, Popconfirm, Space, Tag, Tooltip, Typography, message } from 'antd';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { useState } from 'react';
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
  const [detailOpen, setDetailOpen] = useState(false);
  const images = product.images || product.media || [];
  const cover = images[0];
  const id = getItemId(product);
  const postLinkStatusLabel = product.postLinkStatusLabel || (product.postLinkStatus === 'linked' ? 'Đã gắn với bài đăng' : product.postLinkStatus === 'unlinked' ? 'Chưa gắn với bài đăng' : undefined);
  const postLinkStatusColor = product.postLinkStatus === 'linked' ? 'green' : 'orange';

  const copy = async (text?: string | number, label = 'Nội dung') => {
    if (text === undefined || text === null || text === '') return message.warning('Không có nội dung để copy');
    await navigator.clipboard.writeText(String(text));
    message.success(`Đã copy ${label}`);
  };

  const copyButton = (text?: string | number, label = 'Nội dung') => (
    <Button size="small" icon={<CopyOutlined />} onClick={() => copy(text, label)}>
      Copy
    </Button>
  );

  const detailLine = (content: ReactNode, copyText?: string | number, label = 'Nội dung') => (
    <div className="detail-line">
      <div className="detail-value">{content}</div>
      <div className="detail-actions">{copyButton(copyText, label)}</div>
    </div>
  );

  return (
    <>
      <Card
        className="storage-card clickable-card"
        hoverable
        onClick={() => setDetailOpen(true)}
        cover={cover ? <Image className="card-cover" src={cover} alt={product.name} preview={false} /> : <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có ảnh" />}
        actions={[
          <Tooltip title="Copy tên" key="copy-name">
            <Button type="text" icon={<CopyOutlined />} onClick={(event) => {
              event.stopPropagation();
              copy(product.name, 'tên sản phẩm');
            }} />
          </Tooltip>,
          <Tooltip title="Sửa" key="edit">
            <Button type="text" icon={<EditOutlined />} onClick={(event) => {
              event.stopPropagation();
              onEdit(product);
            }} />
          </Tooltip>,
          <Popconfirm
            key="delete"
            title="Xóa sản phẩm?"
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={(event) => {
              event?.stopPropagation();
              onDelete(id);
            }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} onClick={(event) => event.stopPropagation()} />
          </Popconfirm>,
        ]}
      >
        <Space direction="vertical" size={6} className="w-100">
          {product.similarity !== undefined && <Tag color="cyan">Độ giống: {Math.round(Number(product.similarity) * (Number(product.similarity) <= 1 ? 100 : 1))}%</Tag>}
          <Text strong ellipsis title={product.name}>
            {product.name}
          </Text>
          <Tag color={product.price ? 'green' : 'default'}>{formatVND(product.price)}</Tag>
          {postLinkStatusLabel && <Tag color={postLinkStatusColor}>{postLinkStatusLabel}</Tag>}
          {product.link && (
            <Paragraph className="card-link" copyable={{ text: product.link }} ellipsis={{ rows: 1 }}>
              <LinkOutlined /> {product.link}
            </Paragraph>
          )}
          {product.note && <Paragraph ellipsis={{ rows: 2 }}>{product.note}</Paragraph>}
        </Space>
      </Card>

      <Modal
        title="Chi tiết sản phẩm"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={[
          <Button key="copy-all" icon={<CopyOutlined />} onClick={() => copy([
            `Tên: ${product.name || ''}`,
            `Giá: ${formatVND(product.price)}`,
            `Link: ${product.link || ''}`,
            `Ghi chú: ${product.note || ''}`,
            `Liên kết bài đăng: ${postLinkStatusLabel || ''}`,
          ].join('\n'), 'thông tin sản phẩm')}>
            Copy tất cả
          </Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => {
            setDetailOpen(false);
            onEdit(product);
          }}>
            Sửa
          </Button>,
        ]}
      >
        <Space direction="vertical" className="w-100" size="middle">
          {images.length > 0 && (
            <Image.PreviewGroup>
              <div className="modal-media-grid">
                {images.map((image) => (
                  <Image key={image} src={image} alt={product.name} className="modal-media-image" />
                ))}
              </div>
            </Image.PreviewGroup>
          )}

          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Tên sản phẩm">
              {detailLine(<Text>{product.name || '-'}</Text>, product.name, 'tên sản phẩm')}
            </Descriptions.Item>
            <Descriptions.Item label="Giá">
              {detailLine(<Tag color={product.price ? 'green' : 'default'}>{formatVND(product.price)}</Tag>, product.price, 'giá')}
            </Descriptions.Item>
            <Descriptions.Item label="Link">
              {detailLine(
                product.link ? <Typography.Link href={product.link} target="_blank">{product.link}</Typography.Link> : <Text>-</Text>,
                product.link,
                'link',
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ghi chú">
              {detailLine(<Paragraph>{product.note || '-'}</Paragraph>, product.note, 'ghi chú')}
            </Descriptions.Item>
            <Descriptions.Item label="Liên kết bài đăng">
              {detailLine(
                postLinkStatusLabel ? <Tag color={postLinkStatusColor}>{postLinkStatusLabel}</Tag> : <Text>-</Text>,
                postLinkStatusLabel,
                'liên kết bài đăng',
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{product.createdAt ? dayjs(product.createdAt).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
            <Descriptions.Item label="Cập nhật">{product.updatedAt ? dayjs(product.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
          </Descriptions>
        </Space>
      </Modal>
    </>
  );
}