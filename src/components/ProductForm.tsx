import { InboxOutlined, LinkOutlined, ReloadOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Form, Input, InputNumber, Space, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import { useEffect, useState } from 'react';
import { uploadService } from '../services/upload.service';
import type { Product, ProductPayload } from '../types/product';
import MediaPreview from './MediaPreview';

interface ProductFormProps {
  editing?: Product | null;
  loading?: boolean;
  onSubmit: (payload: ProductPayload) => Promise<void>;
  onCancelEdit: () => void;
}

export default function ProductForm({ editing, loading, onSubmit, onCancelEdit }: ProductFormProps) {
  const [form] = Form.useForm();
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');
  const [pasting, setPasting] = useState(false);

  useEffect(() => {
    if (editing) {
      form.setFieldsValue(editing);
      setMediaUrls(editing.images || editing.media || []);
    } else {
      form.resetFields();
      setMediaUrls([]);
    }
  }, [editing, form]);

  const uploadProps: UploadProps = {
    accept: 'image/*',
    multiple: true,
    showUploadList: false,
    beforeUpload: async (file, fileList) => {
      if (file.uid !== fileList[0].uid) return Upload.LIST_IGNORE;
      try {
        setUploading(true);
        const urls = await uploadService.uploadMultiple(fileList);
        setMediaUrls((prev) => [...prev, ...urls]);
        message.success('Upload ảnh thành công');
      } catch (error: any) {
        message.error(error?.response?.data?.message || 'Upload thất bại');
      } finally {
        setUploading(false);
      }
      return Upload.LIST_IGNORE;
    },
  };

  const handlePasteUpload = async () => {
    const url = pasteUrl.trim();
    if (!url) {
      message.warning('Vui lòng nhập URL ảnh');
      return;
    }

    try {
      setPasting(true);
      const uploadedUrl = await uploadService.pasteUpload(url);
      if (!uploadedUrl) throw new Error('Không nhận được URL Cloudinary');
      setMediaUrls((prev) => [...prev, uploadedUrl]);
      setPasteUrl('');
      message.success('Lưu ảnh từ URL thành công');
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Lưu ảnh từ URL thất bại');
    } finally {
      setPasting(false);
    }
  };

  const handleFinish = async (values: any) => {
    await onSubmit({
      name: values.name,
      price: values.price,
      link: values.link,
      note: values.note,
      images: mediaUrls,
    });
    if (!editing) {
      form.resetFields();
      setMediaUrls([]);
    }
  };

  return (
    <div className="form-panel">
      <h3>{editing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm'}</h3>
      <Upload.Dragger {...uploadProps} disabled={uploading || pasting}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p>Kéo thả hoặc chọn nhiều ảnh sản phẩm</p>
      </Upload.Dragger>

      <Space.Compact className="w-100">
        <Input
          value={pasteUrl}
          onChange={(event) => setPasteUrl(event.target.value)}
          onPressEnter={handlePasteUpload}
          placeholder="Paste URL ảnh để upload lên Cloudinary"
          disabled={uploading || pasting}
        />
        <Button icon={<LinkOutlined />} loading={pasting} onClick={handlePasteUpload}>
          Lưu URL
        </Button>
      </Space.Compact>

      <MediaPreview urls={mediaUrls} onRemove={(url) => setMediaUrls((prev) => prev.filter((item) => item !== url))} />

      <Form form={form} layout="vertical" onFinish={handleFinish}>
        <Form.Item name="name" label="Tên sản phẩm" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
          <Input placeholder="Nhập tên sản phẩm" />
        </Form.Item>
        <Form.Item name="price" label="Giá cả">
          <InputNumber className="w-100" min={0} placeholder="Nhập giá" addonAfter="VND" />
        </Form.Item>
        <Form.Item name="link" label="Link đường dẫn">
          <Input placeholder="https://..." />
        </Form.Item>
        <Form.Item name="note" label="Ghi chú">
          <Input.TextArea rows={4} placeholder="Ghi chú sản phẩm" />
        </Form.Item>
        <Space wrap>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading || uploading || pasting}>
            {editing ? 'Cập nhật' : 'Lưu sản phẩm'}
          </Button>
          <Button icon={<ReloadOutlined />} onClick={onCancelEdit}>
            {editing ? 'Hủy sửa' : 'Làm mới'}
          </Button>
        </Space>
      </Form>
    </div>
  );
}