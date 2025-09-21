# components/Canvas/overlays 目录说明

- **[职责]** 画布编辑态覆盖层（非图元本体），通过 HTML 层配合 Konva 实现更好的编辑体验。
- **[主要文件]**
  - `TextEditorOverlay.tsx`：文本双击进入编辑时的 HTML 文本输入层。
  - `CommentEditorOverlay.tsx`：评论创建时的输入层，负责像素坐标与舞台坐标的互转。
