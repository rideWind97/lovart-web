import React from "react";
import { Layout, Button } from "antd";
import { MessageOutlined } from "@ant-design/icons";
import { CanvasAreaKonva as CanvasArea } from "../Canvas/CanvasAreaKonva";
import { Toolbar } from "../Toolbar/Toolbar";
import { Header } from "./Header";
// import { TextPropertiesPanel } from "../Canvas/TextPropertiesPanel";
import { TextToolbar } from "../Canvas/TextToolbar";
import { CommentPanel } from "../Comment/CommentPanel";
import { useCanvasStore } from "@/stores/canvasStore";
import { useCommentStore } from "@/stores/commentStore";

const { Content } = Layout;

export const MainLayout: React.FC = () => {
  const { selectedElement, elements } = useCanvasStore();
  const selectedIds = (useCanvasStore as any)((s: any) => s.selectedIds as string[] | undefined);
  const { isCommentPanelOpen, toggleCommentPanel, comments } = useCommentStore();
  
  const selectedTextElement = selectedElement 
    ? elements.find(el => el.id === selectedElement && el.type === 'text')
    : null;

  const hasTextSelection = React.useMemo(() => {
    if (selectedIds && selectedIds.length) {
      return selectedIds.some((id: string) => elements.some((e) => e.id === id && e.type === 'text'));
    }
    return !!selectedTextElement;
  }, [selectedIds, elements, selectedTextElement]);

  return (
    <Layout className="h-screen">
      <Header />
      <Layout className="flex-1 relative">
        <div className="absolute left-0 top-0 z-10">
          <Toolbar />
        </div>
        
        <Content className="w-full h-full">
          <CanvasArea />
        </Content>

        {hasTextSelection && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
            <TextToolbar />
          </div>
        )}

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

        {isCommentPanelOpen && (
          <div className="absolute right-4 top-24 z-20 w-80 h-96 bg-white rounded-lg shadow-xl border">
            <CommentPanel />
          </div>
        )}
      </Layout>
    </Layout>
  );
};
