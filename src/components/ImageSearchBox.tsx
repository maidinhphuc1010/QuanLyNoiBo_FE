import { InboxOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { Button, Image, Space, Typography, Upload } from 'antd';
import type { UploadProps } from 'antd';

interface ImageSearchBoxProps {
  title: string;
  loading: boolean;
  onSearch: (file: File) => void;
  onClear: () => void;
  previewUrl?: string;
}

export default function ImageSearchBox({ title, loading, onSearch, onClear, previewUrl }: ImageSearchBoxProps) {
  const props: UploadProps = {
    accept: 'image/*',
    maxCount: 1,
    showUploadList: false,
    beforeUpload(file) {
      onSearch(file);
      return Upload.LIST_IGNORE;
    },
  };

  return (
    <div className="image-search-box">
      <Space align="center" className="image-search-header" wrap>
        <Typography.Title level={5}>
          <SearchOutlined /> {title}
        </Typography.Title>
        {previewUrl && (
          <Button icon={<DeleteOutlined />} onClick={onClear}>
            Xóa tìm kiếm ảnh
          </Button>
        )}
      </Space>
      <Upload.Dragger {...props} disabled={loading} className="compact-dragger">
        {previewUrl ? (
          <Image src={previewUrl} alt="preview search" height={110} preview={false} />
        ) : (
          <>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p>Kéo thả hoặc chọn 1 ảnh mẫu</p>
          </>
        )}
      </Upload.Dragger>
    </div>
  );
}