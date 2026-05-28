import { CheckCircleOutlined, CopyOutlined, DeleteOutlined, DownloadOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Descriptions, Image, Modal, Popconfirm, Space, Tag, Tooltip, Typography, message } from 'antd';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { getItemId } from '../services/api';
import { uploadService } from '../services/upload.service';
import type { Post, PostedAccount, PostMedia, PostStatus } from '../types/post';
import { isVideo } from './MediaPreview';

interface PostCardProps {
  post: Post;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  onTogglePosted: (post: Post) => void;
}

function getMediaUrl(media: string | PostMedia): string {
  return typeof media === 'string' ? media : media.url;
}

function getMediaDownloadUrl(media: string | PostMedia): string {
  if (typeof media === 'string') return media;
  return uploadService.getDownloadUrl({
    downloadUrl: media.downloadUrl,
    publicId: media.publicId,
    resourceType: media.resourceType || media.type,
  }) || media.url;
}

const postStatusLabel: Record<PostStatus, string> = {
  draft: 'Đang chờ',
  posted: 'Đã post',
};

const platformLabels: Record<string, string> = {
  facebook: 'Facebook',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  zalo: 'Zalo',
  shopee: 'Shopee',
  lazada: 'Lazada',
  other: 'Khác',
};

function getPlatformLabel(platform?: string) {
  return platform ? platformLabels[platform] || platform : '';
}

function getPostedAccountUsername(account: PostedAccount) {
  return account.accountUsername || account.username;
}

export default function PostCard({ post, onEdit, onDelete, onTogglePosted }: PostCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const id = getItemId(post);
  const media = post.media || [];
  const mediaUrls = media.map(getMediaUrl).filter(Boolean);
  const first = mediaUrls[0] || '';
  const hashtagsText = (post.hashtags || []).join(' ');
  const productLinksText = (post.productLinks || []).join('\n');
  const relatedProductsText = post.relatedProducts?.map((product) => product.name).filter(Boolean).join(', ') || '';
  const postedAccounts = post.postedAccounts || [];
  const postedAccountsText = postedAccounts
    .map((account) => [getPlatformLabel(account.platform), account.accountName || getPostedAccountUsername(account), account.url].filter(Boolean).join(' - '))
    .join('\n');

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

  const handleDownload = (url?: string) => {
    if (!url) return message.warning('Không có link tải xuống');
    window.location.href = url;
  };

  const detailLine = (content: ReactNode, actions?: ReactNode) => (
    <div className="detail-line">
      <div className="detail-value">{content}</div>
      <div className="detail-actions">{actions}</div>
    </div>
  );

  const posted = typeof post.isPosted === 'boolean' ? post.isPosted : post.status === 'posted';
  const effectiveStatus: PostStatus = posted ? 'posted' : 'draft';
  const statusColor = posted ? 'green' : 'orange';
  const statusLabel = postStatusLabel[effectiveStatus];

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
          <Tooltip title={posted ? 'Bỏ đánh dấu đã post' : 'Đánh dấu đã post'} key="toggle-posted">
            <Button
              type="text"
              icon={<CheckCircleOutlined />}
              style={{ color: posted ? '#52c41a' : undefined }}
              onClick={(event) => {
                event.stopPropagation();
                onTogglePosted(post);
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
          <Space wrap>
            <Tag color={statusColor}>{statusLabel}</Tag>
            {postedAccounts.map((account) => (
              <Tag color="blue" key={account.socialAccountId}>
                {[getPlatformLabel(account.platform), account.accountName || getPostedAccountUsername(account)].filter(Boolean).join(' - ') || account.socialAccountId}
              </Tag>
            ))}
          </Space>
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
              `Caption: ${post.caption || ''}`,
              `Hashtag: ${hashtagsText}`,
              `Link sản phẩm: ${productLinksText}`,
              `Sản phẩm liên quan: ${relatedProductsText}`,
              `Media: ${mediaUrls.join('\n')}`,
              `Trạng thái: ${statusLabel}`,
              `Tài khoản đã đăng: ${postedAccountsText}`,
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
            <Descriptions.Item label="Caption">
              {detailLine(<Typography.Paragraph>{post.caption || '-'}</Typography.Paragraph>, copyButton(post.caption || '', 'caption'))}
            </Descriptions.Item>
            <Descriptions.Item label="Hashtag">
              {detailLine(
                <div>{post.hashtags?.map((tag) => <Tag color="teal" key={tag}>{tag.startsWith('#') ? tag : `#${tag}`}</Tag>) || '-'}</div>,
                copyButton(hashtagsText, 'hashtag'),
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Link sản phẩm">
              {detailLine(
                post.productLinks?.length ? post.productLinks.map((link) => (
                  <Typography.Link key={link} href={link} target="_blank">
                    {link}
                  </Typography.Link>
                )) : <Typography.Text>-</Typography.Text>,
                copyButton(productLinksText, 'link sản phẩm'),
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm liên quan">
              {detailLine(
                <Typography.Text>{relatedProductsText || '-'}</Typography.Text>,
                copyButton(relatedProductsText, 'sản phẩm liên quan'),
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Media">
              <Space direction="vertical" className="w-100">
                {media.map((item) => {
                  const url = getMediaUrl(item);
                  const downloadUrl = getMediaDownloadUrl(item);
                  return (
                    <div key={url} className="detail-line">
                      <div className="detail-value">
                        <Typography.Link href={url} target="_blank" ellipsis>
                          {url}
                        </Typography.Link>
                      </div>
                      <div className="detail-actions">
                        {copyButton(url, 'media URL')}
                        <Button size="small" icon={<DownloadOutlined />} onClick={() => handleDownload(downloadUrl)}>
                          Tải về
                        </Button>
                        {downloadUrl !== url && copyButton(downloadUrl, 'link tải xuống')}
                      </div>
                    </div>
                  );
                })}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {detailLine(<Tag color={statusColor}>{statusLabel}</Tag>, copyButton(statusLabel, 'trạng thái'))}
            </Descriptions.Item>
            <Descriptions.Item label="Tài khoản/nền tảng đã đăng">
              {postedAccounts.length ? (
                <Space direction="vertical" className="w-100">
                  {postedAccounts.map((account) => {
                    const label = [getPlatformLabel(account.platform), account.accountName || getPostedAccountUsername(account)].filter(Boolean).join(' - ') || account.socialAccountId;
                    const postedAt = account.postedAt ? dayjs(account.postedAt).format('DD/MM/YYYY HH:mm') : undefined;

                    return (
                      <div key={account.socialAccountId} className="detail-line">
                        <div className="detail-value">
                          <Space direction="vertical" size={2}>
                            <Tag color="blue">{label}</Tag>
                            {postedAt && <Typography.Text type="secondary">Đăng lúc: {postedAt}</Typography.Text>}
                            {account.url ? (
                              <Typography.Link href={account.url} target="_blank" ellipsis>
                                {account.url}
                              </Typography.Link>
                            ) : null}
                            {account.note ? <Typography.Text>{account.note}</Typography.Text> : null}
                          </Space>
                        </div>
                        <div className="detail-actions">
                          {copyButton([label, postedAt, account.url, account.note].filter(Boolean).join('\n'), 'thông tin tài khoản đăng')}
                        </div>
                      </div>
                    );
                  })}
                </Space>
              ) : (
                <Typography.Text>-</Typography.Text>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{post.createdAt ? dayjs(post.createdAt).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
            <Descriptions.Item label="Cập nhật">{post.updatedAt ? dayjs(post.updatedAt).format('DD/MM/YYYY HH:mm') : '-'}</Descriptions.Item>
          </Descriptions>
        </Space>
      </Modal>
    </>
  );
}