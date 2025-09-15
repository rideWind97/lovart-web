import React from 'react';
import { Layout,  Typography, Menu } from 'antd';
import { UserOutlined, SettingOutlined, LogoutOutlined } from '@ant-design/icons';
import { useUserStore } from '@/stores/userStore';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

export const Header: React.FC = () => {
  const {  logout } = useUserStore();

  const handleLogout = () => {
    logout();
  };

  // const userMenu = (
  //   <Menu
  //     items={[
  //       {
  //         key: 'profile',
  //         icon: <UserOutlined />,
  //         label: '个人资料',
  //       },
  //       {
  //         key: 'settings',
  //         icon: <SettingOutlined />,
  //         label: '设置',
  //       },
  //       {
  //         type: 'divider',
  //       },
  //       {
  //         key: 'logout',
  //         icon: <LogoutOutlined />,
  //         label: '退出登录',
  //         onClick: handleLogout,
  //       },
  //     ]}
  //   />
  // );

  return (
    <AntHeader className="bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <Title level={4} className="!mb-0">
            Lovart Web
          </Title>
        </div>
        <Text type="secondary">Untitled</Text>
      </div>

      {/* <div className="flex items-center space-x-4">
        <Button type="primary" size="small">
          120
        </Button>
        
        {user ? (
          <Dropdown overlay={userMenu} placement="bottomRight">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Avatar size="small" icon={<UserOutlined />} />
              <Text>{user.name}</Text>
            </div>
          </Dropdown>
        ) : (
          <Space>
            <Button type="link">登录</Button>
            <Button type="primary">注册</Button>
          </Space>
        )}
      </div> */}
    </AntHeader>
  );
};
