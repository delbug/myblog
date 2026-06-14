import type { Component } from 'vue'
import {
  ApiOutlined,
  AppstoreOutlined,
  CommentOutlined,
  DashboardOutlined,
  DeleteOutlined,
  EditOutlined,
  FileTextOutlined,
  FolderOutlined,
  HistoryOutlined,
  SafetyOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons-vue'

const emojiMap: Record<string, Component> = {
  '📊': DashboardOutlined,
  '📝': FileTextOutlined,
  '✏️': EditOutlined,
  '🗑️': DeleteOutlined,
  '📁': FolderOutlined,
  '🏷️': TagsOutlined,
  '💬': CommentOutlined,
  '👥': TeamOutlined,
  '🔐': SafetyOutlined,
  '📋': UnorderedListOutlined,
  '📜': HistoryOutlined,
  '⚙️': SettingOutlined,
  '📖': ApiOutlined,
}

/** 将菜单 emoji 映射为 Ant Design 图标组件 */
export function resolveAdminMenuIcon(icon?: string | null): Component {
  if (!icon) return AppstoreOutlined
  return emojiMap[icon] || AppstoreOutlined
}
