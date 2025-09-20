import { Layout, Typography } from 'antd';

const { Header: AntHeader } = Layout;
const { Title, Text } = Typography;

export const Header: React.FC = () => {
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
    </AntHeader>
  );
};
