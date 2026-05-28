import { CloseCircleFilled } from '@ant-design/icons';
import { Image } from 'antd';

interface MediaPreviewProps {
  urls: string[];
  onRemove?: (url: string) => void;
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm|m4v|avi)(\?.*)?$/i.test(url);
}

export default function MediaPreview({ urls, onRemove }: MediaPreviewProps) {
  if (!urls.length) return <div className="empty-preview">Chưa có media</div>;

  return (
    <div className="media-grid">
      {urls.map((url) => (
        <div className="media-item" key={url}>
          {onRemove && <CloseCircleFilled className="remove-media" onClick={() => onRemove(url)} />}
          {isVideo(url) ? <video src={url} controls /> : <Image src={url} alt="media" />}
        </div>
      ))}
    </div>
  );
}

export { isVideo };