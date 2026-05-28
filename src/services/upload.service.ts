import api from './api';

export interface UploadedFile {
  url: string;
  secureUrl?: string;
  downloadUrl?: string;
  type?: 'image' | 'video' | string;
  publicId?: string;
  resourceType?: 'image' | 'video' | string;
  originalFilename?: string;
  bytes?: number;
  format?: string;
}

function normalizeFiles(data: any): UploadedFile[] {
  const raw = data?.data ?? data;

  if (Array.isArray(raw)) {
    return raw
      .map((item) => (typeof item === 'string' ? { url: item } : item))
      .filter((item) => item?.url);
  }

  if (Array.isArray(raw?.urls)) {
    return raw.urls.map((url: string) => ({ url }));
  }

  if (Array.isArray(raw?.files)) {
    return raw.files
      .map((item: any) => (typeof item === 'string' ? { url: item } : item))
      .filter((item: UploadedFile) => item?.url);
  }

  if (raw?.url) return [raw];

  return [];
}

function normalizeUrls(data: any): string[] {
  return normalizeFiles(data).map((item) => item.secureUrl || item.url).filter(Boolean);
}

export const uploadService = {
  async uploadSingleFile(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/upload/single', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeFiles(response.data)[0];
  },

  async uploadSingle(file: File): Promise<string> {
    const uploaded = await this.uploadSingleFile(file);
    return uploaded?.secureUrl || uploaded?.url;
  },

  async uploadMultipleFiles(files: File[]): Promise<UploadedFile[]> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    const response = await api.post('/upload/multiple', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeFiles(response.data);
  },

  async uploadMultiple(files: File[]): Promise<string[]> {
    const uploadedFiles = await this.uploadMultipleFiles(files);
    return uploadedFiles.map((item) => item.secureUrl || item.url).filter(Boolean);
  },

  async pasteUploadFile(url: string): Promise<UploadedFile> {
    const response = await api.post('/upload/paste', { url });
    return normalizeFiles(response.data)[0];
  },

  async pasteUpload(url: string): Promise<string> {
    const uploaded = await this.pasteUploadFile(url);
    return uploaded?.secureUrl || uploaded?.url;
  },

  getDownloadUrl(file: Pick<UploadedFile, 'publicId' | 'resourceType' | 'downloadUrl'>): string | undefined {
    if (file.downloadUrl) return file.downloadUrl;
    if (!file.publicId) return undefined;
    const params = new URLSearchParams({
      publicId: file.publicId,
      resourceType: file.resourceType || 'image',
    });
    return `${api.defaults.baseURL || ''}/upload/download?${params.toString()}`;
  },
};
