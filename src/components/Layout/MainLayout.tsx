import React from "react";
import { Layout, Button } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { CanvasArea } from "../Canvas/CanvasArea";
import { Toolbar } from "../Toolbar/Toolbar";
import { Header } from "./Header";
import { TextPropertiesPanel } from "../Canvas/TextPropertiesPanel";
import { CommentPanel } from "../Comment/CommentPanel";
import { useCanvasStore } from "@/stores/canvasStore";
import { useCommentStore } from "@/stores/commentStore";

const { Content } = Layout;

export const MainLayout: React.FC = () => {
  const { selectedElement, elements } = useCanvasStore();
  const { isCommentPanelOpen, toggleCommentPanel, comments } = useCommentStore();
  
  const selectedTextElement = selectedElement 
    ? elements.find(el => el.id === selectedElement && el.type === 'text')
    : null;

  return (
    <Layout className="h-screen">
      <Header />
      <Layout className="flex-1 relative">
        {/* 绝对定位的工具栏 */}
        <div className="absolute left-0 top-0 z-10">
          <Toolbar />
        </div>
        
        {/* 100%大小的Canvas区域 */}
        <Content className="w-full h-full">
          <CanvasArea />
        </Content>

        {/* 文本属性面板 */}
        {selectedTextElement && (
          <div className="absolute right-4 top-4 z-20">
            <TextPropertiesPanel />
          </div>
        )}

        {/* 评论面板切换按钮 */}
        <div className="absolute right-4 top-16 z-20">
          <Button
            type="primary"
            icon={<MessageOutlined />}
            onClick={toggleCommentPanel}
            className="shadow-lg"
          >
            评论 ({comments.length})
          </Button>
        </div>

        {/* 评论面板 */}
        {isCommentPanelOpen && (
          <div className="absolute right-4 top-24 z-20 w-80 h-96 bg-white rounded-lg shadow-xl border">
            <CommentPanel />
          </div>
        )}
      </Layout>
    </Layout>
  );
};
