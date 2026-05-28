import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Image, Modal, Popconfirm, Space, Tag, Tooltip, Typography, message } from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import { getItemId } from '../services/api';
import type { Post, PostMedia } from '../types/post';
import { isVideo } from './MediaPreview';

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
}

function getMediaUrl(media: string | PostMedia): string {
  return typeof media === 'string' ? media : media.url;
}

function getMediaDownloadUrl(media: string | PostMedia): string {
  return typeof media === 'string' ? media : media.downloadUrl || media.url;
}

function getMediaPublicId(media: string | PostMedia): string {
  return typeof media === 'string' ? '' : media.publicId || '';
}

export default function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const id = getItemId(post);
  const media = post.media || [];
  const mediaUrls = media.map(getMediaUrl).filter(Boolean);
  const first = mediaUrls[0] || '';
  const hashtagsText = (post.hashtags || []).join(' ');
  const productLinksText = (post.productLinks || []).join('\n');
  const relatedProductsText = post.relatedProducts?.map((product) => product.name || product.id || product._id).filter(Boolean).join(', ') || '';
  const productIdsText = (post.productIds || post.relatedProductIds || []).join(', ');

  const copy = async (text?: string, label = 'nội dung') => {
    if (!text) return message.warning('Không có nội dung để copy');
    await navigator.clipboard.writeText(text);
    message.success(`Đã copy ${label}`);
  };

  const copyButton = (text?: string, label = 'nội dung') => (
    <Button size="small" icon={<CopyOutlined />} onClick={() => copy(text, label)}>
      Copy
    </Button>
  );

  const statusColor = post.status === 'posted' ? 'green' : post.status === 'scheduled' ? 'blue' : 'orange';

  return (
    <>
      <Card
        className="storage-card clickable-card"
        hoverable
        onClick={() => setDetailOpen(true)}
        cover={
          first ? (
            isVideo(first) ? (
              <video
                className="card-cover"
                src={first}
                controls
                onClick={(event) => {
                  event.stopPropagation();
                  setDetailOpen(true);
                }}
              />
            ) : (
              <Image
                className="card-cover"
                src={first}
                alt="post"
                preview={false}
                onClick={(event) => {
                  event.stopPropagation();
                  setDetailOpen(true);
                }}
              />
            )
          ) : (
            <div className="no-cover">Không có media</div>
          )
        }
        actions={[
          <Tooltip title="Copy caption" key="caption">
            <Button
              type="text"
              icon={<CopyOutlined />}
              onClick={(event) => {
                event.stopPropagation();
                copy(post.caption || '', 'caption');
              }}
            />
          </Tooltip>,
          <Tooltip title="Sửa" key="edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={(event) => {
                event.stopPropagation();
                onEdit(post);
              }}
            />
          </Tooltip>,
          <Popconfirm
            key="delete"
            title="Xóa bài đăng?"
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
        <Space direction="vertical" className="w-100" size={8}>
          {post.similarity !== undefined && <Tag color="cyan">Độ giống: {Math.round(Number(post.similarity) * (Number(post.similarity) <= 1 ? 100 : 1))}%</Tag>}
          <Typography.Paragraph ellipsis={{ rows: 3 }}>{post.caption || 'Chưa có caption'}</Typography.Paragraph>
          <div>{post.hashtags?.map((tag) => <Tag color="teal" key={tag}>{tag.startsWith('#') ? tag : `#${tag}`}</Tag>)}</div>
          <Button
            size="small"
            onClick={(event) => {
              event.stopPropagation();
              copy(hashtagsText, 'hashtag');
            }}
          >
            Copy hashtag
          </Button>
          <Space direction="vertical" size={2}>
            {post.productLinks?.map((link) => (
              <Typography.Link
                key={link}
                href={link}
                target="_blank"
                ellipsis
                onClick={(event) => event.stopPropagation()}
              >
                {link}
              </Typography.Link>
            ))}
          </Space>
          <Tag color={statusColor}>{post.status}</Tag>
        </Space>
      </Card>

      <Modal
        title="Chi tiết bài đăng"
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        width={760}
        footer={[
          <Button
            key="copy-all"
            icon={<CopyOutlined />}
            onClick={() => copy([
              `ID: ${id}`,
              `Caption: ${post.caption || ''}`,
              `Hashtag: ${hashtagsText}`,
              `Link sản phẩm: ${productLinksText}`,
              `Sản phẩm liên quan: ${relatedProductsText || productIdsText}`,
              `Media: ${mediaUrls.join('\n')}`,
              `Trạng thái: ${post.status}`,
            ].join('\n'), 'thông tin bài đăng')}
          >
            Copy tất cả
          </Button>,
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setDetailOpen(false);
              onEdit(post);
            }}
          >
            Sửa
          </Button>,
        ]}
      >
        <Space direction="vertical" className="w-100" size="middle">
          {mediaUrls.length > 0 && (
            <div className="modal-media-grid">
              {media.map((item) => {
                const url = getMediaUrl(item);
                if (!url) return null;

                return isVideo(url) ? (
                  <video key={url} src={url} className="modal-media-image" controls />
                ) : (
                  <Image key={url} src={url} alt="post media" className="modal-media-image" />
                );
              })}
            </div>
          )}

          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="ID">
              <Space>
                <Typography.Text code>{id}</Typography.Text>
                {copyButton(id, 'ID')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Caption">
              <Space direction="vertical" className="w-100">
                <Typography.Paragraph>{post.caption || '-'}</Typography.Paragraph>
                {copyButton(post.caption || '', 'caption')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Hashtag">
              <Space direction="vertical" className="w-100">
                <div>{post.hashtags?.map((tag) => <Tag color="teal" key={tag}>{tag.startsWith('#') ? tag : `#${tag}`}</Tag>) || '-'}</div>
                {copyButton(hashtagsText, 'hashtag')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Link sản phẩm">
              <Space direction="vertical" className="w-100">
                {post.productLinks?.length ? post.productLinks.map((link) => (
                  <Typography.Link key={link} href={link} target="_blank">
                    {link}
                  </Typography.Link>
                )) : '-'}
                {copyButton(productLinksText, 'link sản phẩm')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm liên quan">
              <Space direction="vertical" className="w-100">
                <Typography.Text>{relatedProductsText || productIdsText || '-'}</Typography.Text>
                {copyButton(relatedProductsText || productIdsText, 'sản phẩm liên quan')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Media">
              <Space direction="vertical" className="w-100">
                {media.map((item) => {
                  const url = getMediaUrl(item);
                  const downloadUrl = getMediaDownloadUrl(item);
                  const publicId = getMediaPublicId(item);

                  return (
                    <Space direction="vertical" key={url} className="w-100">
                      <Typography.Link href={url} target="_blank" ellipsis>
                        {url}
                      </Typography.Link>
                      <Space wrap>
                        {copyButton(url, 'media URL')}
                        {downloadUrl !== url && copyButton(downloadUrl, 'link tải xuống')}
                        {publicId && copyButton(publicId, 'public ID')}
                      </Space>
                    </Space>
                  );
                })}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Space>
                <Tag color={statusColor}>{post.status}</Tag>
                {copyButton(post.status, 'trạng thái')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{post.createdAt ? dayjs(post.createdAt).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
            <Descriptions.Item label="Cập nhật">{post.updatedAt ? dayjs(post.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
          </Descriptions>
        </Space>
      </Modal>
    </>
  );
}