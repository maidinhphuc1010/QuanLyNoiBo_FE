import { InboxOutlined, LinkOutlined, SaveOutlined } from '@ant-design/icons';
import { Button, Checkbox, DatePicker, Form, Input, Select, Space, Upload, message } from 'antd';
import type { UploadProps } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { getItemId } from '../services/api';
import { productService } from '../services/product.service';
import { socialAccountService } from '../services/social-account.service';
import { uploadService } from '../services/upload.service';
import type { Post, PostMedia, PostPayload, PostedAccount } from '../types/post';
import type { SocialAccount } from '../types/social-account';
import type { Product } from '../types/product';
import MediaPreview from './MediaPreview';

interface PostFormProps {
  editing?: Post | null;
  loading?: boolean;
  onSubmit: (payload: PostPayload) => Promise<void>;
  onCancelEdit: () => void;
}

function getMediaUrl(media: string | PostMedia): string {
  return typeof media === 'string' ? media : media.url;
}

function getMediaType(url: string): 'image' | 'video' {
  return /\.(mp4|mov|webm|m4v|avi)(\?.*)?$/i.test(url) ? 'video' : 'image';
}

function toPostMedia(url: string): PostMedia {
  return {
    url,
    type: getMediaType(url),
  };
}

function getPlatformLabel(platform?: string) {
  const labels: Record<string, string> = {
    facebook: 'Facebook',
    tiktok: 'TikTok',
    instagram: 'Instagram',
    youtube: 'YouTube',
    zalo: 'Zalo',
    shopee: 'Shopee',
    lazada: 'Lazada',
    other: 'Khác',
  };

  return platform ? labels[platform] || platform : '';
}

export default function PostForm({ editing, loading, onSubmit, onCancelEdit }: PostFormProps) {
  const [form] = Form.useForm();
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [pasteUrl, setPasteUrl] = useState('');
  const [pasting, setPasting] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);

  useEffect(() => {
    productService.getProducts({ page: 1, limit: 100 }).then((res) => setProducts(res.data)).catch(() => undefined);
    socialAccountService
      .getSocialAccounts({ page: 1, limit: 200, isActive: true })
      .then((res) => setSocialAccounts(res.data))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (editing) {
      form.setFieldsValue({
        ...editing,
        relatedProductIds:
          editing.productIds || editing.relatedProductIds || editing.relatedProducts?.map((p) => p.id || p._id).filter(Boolean),
        isPosted: typeof editing.isPosted === 'boolean' ? editing.isPosted : editing.status === 'posted',
        postedAccountIds: editing.postedAccounts?.map((account) => account.socialAccountId).filter(Boolean) || [],
        postedAccountUrls: Object.fromEntries(
          (editing.postedAccounts || [])
            .filter((account) => account.socialAccountId)
            .map((account) => [account.socialAccountId, account.url]),
        ),
        postedAccountNotes: Object.fromEntries(
          (editing.postedAccounts || [])
            .filter((account) => account.socialAccountId)
            .map((account) => [account.socialAccountId, account.note]),
        ),
        postedAccountDates: Object.fromEntries(
          (editing.postedAccounts || [])
            .filter((account) => account.socialAccountId && account.postedAt)
            .map((account) => [account.socialAccountId, dayjs(account.postedAt)]),
        ),
      });
      setMediaUrls((editing.media || []).map(getMediaUrl).filter(Boolean));
    } else {
      form.resetFields();
      setMediaUrls([]);
    }
  }, [editing, form]);

  const uploadProps: UploadProps = {
    accept: 'image/*,video/*',
    multiple: true,
    showUploadList: false,
    beforeUpload: async (file, fileList) => {
      if (file.uid !== fileList[0].uid) return Upload.LIST_IGNORE;
      try {
        setUploading(true);
        const urls = await uploadService.uploadMultiple(fileList);
        setMediaUrls((prev) => [...prev, ...urls]);
        message.success('Upload media thành công');
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
      message.warning('Vui lòng nhập URL ảnh/video');
      return;
    }

    try {
      setPasting(true);
      const uploadedUrl = await uploadService.pasteUpload(url);
      if (!uploadedUrl) throw new Error('Không nhận được URL Cloudinary');
      setMediaUrls((prev) => [...prev, uploadedUrl]);
      setPasteUrl('');
      message.success('Lưu media từ URL thành công');
    } catch (error: any) {
      message.error(error?.response?.data?.message || error?.message || 'Lưu media từ URL thất bại');
    } finally {
      setPasting(false);
    }
  };

  const buildPostedAccounts = (values: any): PostedAccount[] => {
    const selectedIds: string[] = values.postedAccountIds || [];
    return selectedIds
      .map((socialAccountId) => ({
        socialAccountId,
        postedAt: values.postedAccountDates?.[socialAccountId]?.toISOString?.(),
        url: values.postedAccountUrls?.[socialAccountId],
        note: values.postedAccountNotes?.[socialAccountId],
      }))
      .filter((account) => account.socialAccountId);
  };

  const handleFinish = async (values: any) => {
    const postedSocialAccountIds: string[] = values.postedAccountIds || [];
    const postedAccounts = buildPostedAccounts(values);
    await onSubmit({
      caption: values.caption,
      hashtags: values.hashtags || [],
      productLinks: values.productLinks || [],
      productIds: values.relatedProductIds || [],
      postedSocialAccountIds,
      postedAccounts,
      status: values.isPosted || postedSocialAccountIds.length ? 'posted' : 'draft',
      isPosted: Boolean(values.isPosted || postedSocialAccountIds.length),
      media: mediaUrls.map(toPostMedia),
    });
    if (!editing) {
      form.resetFields();
      setMediaUrls([]);
    }
  };

  return (
    <div className="form-panel">
      <h3>{editing ? 'Cập nhật bài đăng' : 'Thêm bài đăng'}</h3>
      <Upload.Dragger {...uploadProps} disabled={uploading || pasting}>
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p>Kéo thả hoặc chọn nhiều ảnh/video</p>
      </Upload.Dragger>

      <Space.Compact className="w-100">
        <Input
          value={pasteUrl}
          onChange={(event) => setPasteUrl(event.target.value)}
          onPressEnter={handlePasteUpload}
          placeholder="Paste URL ảnh/video để upload lên Cloudinary"
          disabled={uploading || pasting}
        />
        <Button icon={<LinkOutlined />} loading={pasting} onClick={handlePasteUpload}>
          Lưu URL
        </Button>
      </Space.Compact>

      <MediaPreview urls={mediaUrls} onRemove={(url) => setMediaUrls((prev) => prev.filter((item) => item !== url))} />

      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={{ isPosted: false, postedAccountIds: [] }}>
        <Form.Item name="caption" label="Caption">
          <Input.TextArea rows={4} placeholder="Nội dung caption" />
        </Form.Item>
        <Form.Item name="hashtags" label="Hashtag">
          <Select mode="tags" tokenSeparators={[',', ' ']} placeholder="Nhập nhiều hashtag" />
        </Form.Item>
        <Form.Item name="productLinks" label="Link sản phẩm">
          <Select mode="tags" tokenSeparators={[',', ' ']} placeholder="Nhập nhiều link" />
        </Form.Item>
        <Form.Item name="relatedProductIds" label="Sản phẩm liên quan">
          <Select
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            options={products.map((p) => ({ label: p.name, value: getItemId(p) }))}
            placeholder="Chọn sản phẩm"
          />
        </Form.Item>
        <Form.Item name="isPosted" valuePropName="checked">
          <Checkbox>Đã post</Checkbox>
        </Form.Item>
        <Form.Item name="postedAccountIds" label="Tài khoản/nền tảng đã đăng">
          <Select
            mode="multiple"
            allowClear
            showSearch
            optionFilterProp="label"
            options={socialAccounts.map((account) => ({
              label: `${getPlatformLabel(account.platform)} - ${account.name}${account.username ? ` (${account.username})` : ''}`,
              value: getItemId(account),
            }))}
            placeholder="Chọn tài khoản/nền tảng đã đăng bài"
          />
        </Form.Item>
        <Form.Item shouldUpdate={(prev, current) => prev.postedAccountIds !== current.postedAccountIds}>
          {({ getFieldValue }) => {
            const selectedIds: string[] = getFieldValue('postedAccountIds') || [];
            if (!selectedIds.length) return null;

            return (
              <Space direction="vertical" className="w-100">
                {selectedIds.map((socialAccountId) => {
                  const account = socialAccounts.find((item) => getItemId(item) === socialAccountId);
                  const label = account
                    ? `${getPlatformLabel(account.platform)} - ${account.name}${account.username ? ` (${account.username})` : ''}`
                    : socialAccountId;

                  return (
                    <Space key={socialAccountId} direction="vertical" className="w-100 posted-account-extra">
                      <strong>{label}</strong>
                      <Form.Item name={['postedAccountUrls', socialAccountId]} label="Link bài đã đăng">
                        <Input placeholder="URL bài đăng trên nền tảng" />
                      </Form.Item>
                      <Form.Item name={['postedAccountDates', socialAccountId]} label="Thời gian đăng">
                        <DatePicker showTime format="DD/MM/YYYY HH:mm" className="w-100" />
                      </Form.Item>
                      <Form.Item name={['postedAccountNotes', socialAccountId]} label="Ghi chú">
                        <Input.TextArea rows={2} placeholder="Ghi chú cho tài khoản/nền tảng này" />
                      </Form.Item>
                    </Space>
                  );
                })}
              </Space>
            );
          }}
        </Form.Item>
        <Space wrap>
          <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading || uploading || pasting}>
            {editing ? 'Cập nhật' : 'Lưu bài đăng'}
          </Button>
          <Button onClick={onCancelEdit}>{editing ? 'Hủy sửa' : 'Làm mới'}</Button>
        </Space>
      </Form>
    </div>
  );
}