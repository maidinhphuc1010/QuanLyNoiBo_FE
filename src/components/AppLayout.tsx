import {
  CalendarOutlined,
  CloudOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  HomeOutlined,
  IdcardOutlined,
  LockOutlined,
  LogoutOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Divider,
  Dropdown,
  Form,
  Input,
  Layout,
  Modal,
  Space,
  Tabs,
  Tag,
  Typography,
  Upload,
  message,
} from 'antd';
import type { MenuProps, UploadProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../App';
import { userService } from '../services/user.service';
import type { ChangePasswordPayload, UpdateMePayload, User } from '../types/user';

const { Header, Content } = Layout;
const { Text, Title } = Typography;

interface WeatherState {
  temperature?: number;
  windSpeed?: number;
  weatherCode?: number;
}

interface LocationState {
  latitude?: number;
  longitude?: number;
  address: string;
}

const weatherDescriptions: Record<number, string> = {
  0: 'Trời quang',
  1: 'Ít mây',
  2: 'Mây rải rác',
  3: 'Nhiều mây',
  45: 'Sương mù',
  48: 'Sương mù đóng băng',
  51: 'Mưa phùn nhẹ',
  53: 'Mưa phùn',
  55: 'Mưa phùn dày',
  61: 'Mưa nhẹ',
  63: 'Mưa vừa',
  65: 'Mưa lớn',
  80: 'Mưa rào nhẹ',
  81: 'Mưa rào',
  82: 'Mưa rào lớn',
  95: 'Dông',
};

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatFullDateTime(date: Date) {
  return new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function getDisplayName(user?: User | null) {
  return user?.name || user?.username || user?.email || 'Người dùng';
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, refreshMe } = useAuth();
  const [profileForm] = Form.useForm<UpdateMePayload>();
  const [passwordForm] = Form.useForm<ChangePasswordPayload>();
  const [now, setNow] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [me, setMe] = useState<User | null>(user);
  const [location, setLocation] = useState<LocationState>({
    address: 'Đang lấy vị trí...',
  });
  const [weather, setWeather] = useState<WeatherState | null>(null);

  const activeUser = me || user;
  const displayName = getDisplayName(activeUser);
  const userStatus = activeUser?.isActive === false || activeUser?.status === 'inactive' ? 'Không hoạt động' : 'Đang hoạt động';

  const weatherText = useMemo(() => {
    if (!weather) return 'Đang lấy thời tiết...';

    const description =
      typeof weather.weatherCode === 'number' ? weatherDescriptions[weather.weatherCode] || 'Thời tiết' : 'Thời tiết';

    return `${Math.round(weather.temperature ?? 0)}°C · ${description}`;
  }, [weather]);

  useEffect(() => {
    setMe(user);
  }, [user]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const fallbackLatitude = 21.0285;
    const fallbackLongitude = 105.8542;

    const loadWeather = async (latitude: number, longitude: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`,
        );
        const data = await response.json();

        setWeather({
          temperature: data?.current_weather?.temperature,
          windSpeed: data?.current_weather?.windspeed,
          weatherCode: data?.current_weather?.weathercode,
        });
      } catch {
        setWeather(null);
      }
    };

    const loadAddress = async (latitude: number, longitude: number, fallbackAddress: string) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
        );
        const data = await response.json();
        const address = data?.address;
        const shortAddress = [
          address?.suburb || address?.quarter || address?.neighbourhood,
          address?.city || address?.town || address?.state,
        ]
          .filter(Boolean)
          .join(', ');

        setLocation({
          latitude,
          longitude,
          address: shortAddress || data?.display_name || fallbackAddress,
        });
      } catch {
        setLocation({
          latitude,
          longitude,
          address: fallbackAddress,
        });
      }
    };

    const applyPosition = (latitude: number, longitude: number, fallbackAddress: string) => {
      setLocation({ latitude, longitude, address: fallbackAddress });
      loadAddress(latitude, longitude, fallbackAddress);
      loadWeather(latitude, longitude);
    };

    if (!navigator.geolocation) {
      applyPosition(fallbackLatitude, fallbackLongitude, 'Hà Nội, Việt Nam');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        applyPosition(position.coords.latitude, position.coords.longitude, 'Vị trí hiện tại');
      },
      () => {
        message.info('Không lấy được vị trí hiện tại, đang dùng mặc định Hà Nội.');
        applyPosition(fallbackLatitude, fallbackLongitude, 'Hà Nội, Việt Nam');
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
  }, []);

  const openProfile = async () => {
    setProfileOpen(true);
    setProfileLoading(true);
    try {
      const profile = await userService.getMe();
      setMe(profile);
      profileForm.setFieldsValue({
        name: profile.name || profile.username,
        username: profile.username || profile.name,
        phone: profile.phone,
        address: profile.address,
      });
    } catch {
      message.error('Không tải được thông tin cá nhân');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (values: UpdateMePayload) => {
    setProfileLoading(true);
    try {
      const updated = await userService.updateMe({
        name: values.name,
        username: values.username || values.name,
        phone: values.phone,
        address: values.address,
      });
      setMe(updated);
      await refreshMe();
      message.success('Đã cập nhật thông tin cá nhân');
    } catch {
      message.error('Cập nhật thông tin cá nhân thất bại');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (values: ChangePasswordPayload) => {
    setPasswordLoading(true);
    try {
      await userService.changeMyPassword(values);
      passwordForm.resetFields();
      message.success('Đã đổi mật khẩu');
    } catch {
      message.error('Đổi mật khẩu thất bại');
    } finally {
      setPasswordLoading(false);
    }
  };

  const avatarUploadProps: UploadProps = {
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: async (file) => {
      setAvatarLoading(true);
      try {
        const updated = await userService.updateMyAvatar(file);
        setMe(updated);
        await refreshMe();
        message.success('Đã cập nhật ảnh đại diện');
      } catch {
        message.error('Upload ảnh đại diện thất bại');
      } finally {
        setAvatarLoading(false);
      }
      return Upload.LIST_IGNORE;
    },
  };

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Trang cá nhân',
      onClick: openProfile,
    },
    {
      key: 'portal',
      icon: <GlobalOutlined />,
      label: 'Cổng thông tin',
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      danger: true,
      onClick: logout,
    },
  ];

  return (
    <Layout className="app-shell">
      <Header className="app-header">
        <div className="app-title">
          <img className="brand-logo small" src="/Logo.png" alt="Content Storage" />
          <span>Content Storage</span>
        </div>

        <div className="header-meta">
          <div className="header-meta-item">
            <CalendarOutlined />
            <span>{formatDateTime(now)}</span>
          </div>
          <div className="header-meta-item">
            <EnvironmentOutlined />
            <span>{location.address}</span>
          </div>
          <div className="header-meta-item">
            <CloudOutlined />
            <span>{weatherText}</span>
          </div>
        </div>

        <Dropdown menu={{ items: menuItems }} trigger={['click']} placement="bottomRight">
          <Button className="profile-trigger" type="text">
            <Space>
              <Avatar src={activeUser?.avatarUrl} icon={<UserOutlined />} />
              <div className="header-user">
                <Text strong>{displayName}</Text>
                <Tag color={activeUser?.role === 'admin' ? 'cyan' : 'green'}>{activeUser?.role}</Tag>
              </div>
            </Space>
          </Button>
        </Dropdown>
      </Header>

      <Content className="app-content">{children}</Content>

      <Modal
        title="Trang cá nhân"
        open={profileOpen}
        onCancel={() => setProfileOpen(false)}
        footer={null}
        width={720}
      >
        <div className="profile-modal">
          <Space align="center" size="middle" wrap>
            <Avatar size={72} src={activeUser?.avatarUrl} icon={<UserOutlined />} />
            <div>
              <Title level={4}>{displayName}</Title>
              <Tag color={activeUser?.role === 'admin' ? 'cyan' : 'green'}>{activeUser?.role}</Tag>
              <Tag color={userStatus === 'Đang hoạt động' ? 'success' : 'default'}>{userStatus}</Tag>
            </div>
            <Upload {...avatarUploadProps}>
              <Button icon={<UploadOutlined />} loading={avatarLoading}>
                Đổi ảnh đại diện
              </Button>
            </Upload>
          </Space>

          <Divider />

          <Tabs
            items={[
              {
                key: 'info',
                label: 'Thông tin',
                children: (
                  <div className="profile-info-list">
                    <div className="profile-info-row">
                      <UserOutlined />
                      <span>Họ tên</span>
                      <Text strong>{activeUser?.name || activeUser?.username || 'Chưa cập nhật'}</Text>
                    </div>
                    <div className="profile-info-row">
                      <MailOutlined />
                      <span>Email</span>
                      <Text strong>{activeUser?.email}</Text>
                    </div>
                    <div className="profile-info-row">
                      <IdcardOutlined />
                      <span>CCCD/CMND</span>
                      <Text>{activeUser?.citizenId || 'Chưa cập nhật'}</Text>
                    </div>
                    <div className="profile-info-row">
                      <PhoneOutlined />
                      <span>Số điện thoại</span>
                      <Text>{activeUser?.phone || 'Chưa cập nhật'}</Text>
                    </div>
                    <div className="profile-info-row">
                      <HomeOutlined />
                      <span>Địa chỉ cá nhân</span>
                      <Text>{activeUser?.address || 'Chưa cập nhật'}</Text>
                    </div>
                    <div className="profile-info-row">
                      <HomeOutlined />
                      <span>ID</span>
                      <Text code>{activeUser?.id || activeUser?._id}</Text>
                    </div>
                    <div className="profile-info-row">
                      <CalendarOutlined />
                      <span>Thời gian hiện tại</span>
                      <Text>{formatFullDateTime(now)}</Text>
                    </div>
                    <div className="profile-info-row">
                      <EnvironmentOutlined />
                      <span>Vị trí hiện tại</span>
                      <Text>{location.address}</Text>
                    </div>
                    <div className="profile-info-row">
                      <CloudOutlined />
                      <span>Thời tiết</span>
                      <Text>{weatherText}</Text>
                    </div>
                  </div>
                ),
              },
              {
                key: 'edit',
                label: 'Chỉnh sửa',
                children: (
                  <Form form={profileForm} layout="vertical" onFinish={handleUpdateProfile}>
                    <Form.Item name="name" label="Họ tên">
                      <Input placeholder="Nhập họ tên" />
                    </Form.Item>
                    <Form.Item name="username" label="Username">
                      <Input placeholder="Nhập username" />
                    </Form.Item>
                    <Form.Item name="phone" label="Số điện thoại">
                      <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                    <Form.Item name="address" label="Địa chỉ">
                      <Input.TextArea rows={3} placeholder="Nhập địa chỉ" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={profileLoading}>
                      Lưu thông tin
                    </Button>
                  </Form>
                ),
              },
              {
                key: 'password',
                label: 'Đổi mật khẩu',
                children: (
                  <Form form={passwordForm} layout="vertical" onFinish={handleChangePassword}>
                    <Form.Item
                      name="currentPassword"
                      label="Mật khẩu hiện tại"
                      rules={[{ required: true, message: 'Nhập mật khẩu hiện tại' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu hiện tại" />
                    </Form.Item>
                    <Form.Item
                      name="newPassword"
                      label="Mật khẩu mới"
                      rules={[{ required: true, message: 'Nhập mật khẩu mới' }, { min: 6, message: 'Tối thiểu 6 ký tự' }]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu mới" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={passwordLoading}>
                      Đổi mật khẩu
                    </Button>
                  </Form>
                ),
              },
            ]}
          />

          <Divider />

          <Button danger icon={<LogoutOutlined />} block onClick={logout}>
            Đăng xuất
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}