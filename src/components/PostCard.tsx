import { CopyOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Image, Popconfirm, Space, Tag, Tooltip, Typography, message } from 'antd';
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

export default function PostCard({ post, onEdit, onDelete }: PostCardProps) {
  const id = getItemId(post);
  const media = post.media || [];
  const first = media[0] ? getMediaUrl(media[0]) : '';

  const copy = async (text: string, label: string) => {
    if (!text) return message.warning('Không có nội dung để copy');
    await navigator.clipboard.writeText(text);
    message.success(`Đã copy ${label}`);
  };

  return (
    <Card
      className="storage-card"
      cover={
        first ? (
          isVideo(first) ? <video className="card-cover" src={first} controls /> : <Image className="card-cover" src={first} alt="post" preview={false} />
        ) : (
          <div className="no-cover">Không có media</div>
        )
      }
      actions={[
        <Tooltip title="Copy caption" key="caption">
          <Button type="text" icon={<CopyOutlined />} onClick={() => copy(post.caption || '', 'caption')} />
        </Tooltip>,
        <Tooltip title="Sửa" key="edit">
          <Button type="text" icon={<EditOutlined />} onClick={() => onEdit(post)} />
        </Tooltip>,
        <Popconfirm key="delete" title="Xóa bài đăng?" okText="Xóa" cancelText="Hủy" onConfirm={() => onDelete(id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>,
      ]}
    >
      <Space direction="vertical" className="w-100" size={8}>
        {post.similarity !== undefined && <Tag color="cyan">Độ giống: {Math.round(Number(post.similarity) * (Number(post.similarity) <= 1 ? 100 : 1))}%</Tag>}
        <Typography.Paragraph ellipsis={{ rows: 3 }}>{post.caption || 'Chưa có caption'}</Typography.Paragraph>
        <div>{post.hashtags?.map((tag) => <Tag color="teal" key={tag}>{tag.startsWith('#') ? tag : `#${tag}`}</Tag>)}</div>
        <Button size="small" onClick={() => copy((post.hashtags || []).join(' '), 'hashtag')}>Copy hashtag</Button>
        <Space direction="vertical" size={2}>
          {post.productLinks?.map((link) => (
            <Typography.Link key={link} href={link} target="_blank" ellipsis>
              {link}
            </Typography.Link>
          ))}
        </Space>
        <Tag color={post.status === 'posted' ? 'green' : post.status === 'scheduled' ? 'blue' : 'orange'}>{post.status}</Tag>
      </Space>
    </Card>
  );
}