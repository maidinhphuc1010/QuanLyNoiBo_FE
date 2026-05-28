import {
  CalendarOutlined,
  CloudOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  HomeOutlined,
  LogoutOutlined,
  MailOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Divider, Dropdown, Layout, Modal, Space, Tag, Typography, message } from 'antd';
import type { MenuProps } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../App';

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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [now, setNow] = useState(new Date());
  const [profileOpen, setProfileOpen] = useState(false);
  const [location, setLocation] = useState<LocationState>({
    address: 'Đang lấy vị trí...',
  });
  const [weather, setWeather] = useState<WeatherState | null>(null);

  const displayName = user?.name || user?.username || user?.email || 'Người dùng';
  const userStatus = user?.isActive === false || user?.status === 'inactive' ? 'Không hoạt động' : 'Đang hoạt động';

  const weatherText = useMemo(() => {
    if (!weather) return 'Đang lấy thời tiết...';

    const description =
      typeof weather.weatherCode === 'number' ? weatherDescriptions[weather.weatherCode] || 'Thời tiết' : 'Thời tiết';

    return `${Math.round(weather.temperature ?? 0)}°C · ${description}`;
  }, [weather]);

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

  const menuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Trang cá nhân',
      onClick: () => setProfileOpen(true),
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
              <Avatar icon={<UserOutlined />} />
              <div className="header-user">
                <Text strong>{displayName}</Text>
                <Tag color={user?.role === 'admin' ? 'cyan' : 'green'}>{user?.role}</Tag>
              </div>
            </Space>
          </Button>
        </Dropdown>
      </Header>

      <Content className="app-content">{children}</Content>

      <Modal title="Trang cá nhân" open={profileOpen} onCancel={() => setProfileOpen(false)} footer={null}>
        <div className="profile-modal">
          <Space align="center" size="middle">
            <Avatar size={64} icon={<UserOutlined />} />
            <div>
              <Title level={4}>{displayName}</Title>
              <Tag color={user?.role === 'admin' ? 'cyan' : 'green'}>{user?.role}</Tag>
              <Tag color={userStatus === 'Đang hoạt động' ? 'success' : 'default'}>{userStatus}</Tag>
            </div>
          </Space>

          <Divider />

          <div className="profile-info-list">
            <div className="profile-info-row">
              <UserOutlined />
              <span>Họ tên</span>
              <Text strong>{user?.name || user?.username || 'Chưa cập nhật'}</Text>
            </div>
            <div className="profile-info-row">
              <MailOutlined />
              <span>Email</span>
              <Text strong>{user?.email}</Text>
            </div>
            <div className="profile-info-row">
              <HomeOutlined />
              <span>ID</span>
              <Text code>{user?.id || user?._id}</Text>
            </div>
            <div className="profile-info-row">
              <CalendarOutlined />
              <span>Thời gian hiện tại</span>
              <Text>{formatFullDateTime(now)}</Text>
            </div>
            <div className="profile-info-row">
              <EnvironmentOutlined />
              <span>Địa chỉ</span>
              <Text>{location.address}</Text>
            </div>
            <div className="profile-info-row">
              <CloudOutlined />
              <span>Thời tiết</span>
              <Text>{weatherText}</Text>
            </div>
          </div>

          <Divider />

          <Button danger icon={<LogoutOutlined />} block onClick={logout}>
            Đăng xuất
          </Button>
        </div>
      </Modal>
    </Layout>
  );
}