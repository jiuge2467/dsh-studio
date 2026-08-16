/**
 * @module dsh-better-sidebar-mcp/client/components/Icons
 * @description DSH 规范 16x16 / 14x14 矢量 SVG 图标集（纯矢量，无 emoji，主题自适应）
 */

import React from 'react'

export interface IconProps {
  size?: number
  className?: string
  style?: React.CSSProperties
}

/** MCP 标准插件连接器图标 (16x16) */
export function IconMcpPlugin({ size = 16, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <rect x="2.5" y="4.5" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.25" />
      <path d="M5.5 2V4.5M10.5 2V4.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M5.5 8.5H10.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <circle cx="8" cy="8.5" r="1.25" fill="currentColor" />
    </svg>
  )
}

/** 刷新图标 */
export function IconRefresh({ size = 14, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M13.5 2.5v4h-4" />
      <path d="M2.5 13.5v-4h4" />
      <path d="M3.5 7a5 5 0 0 1 8.5-2.5l1.5 2M12.5 9a5 5 0 0 1-8.5 2.5l-1.5-2" />
    </svg>
  )
}

/** 添加图标 */
export function IconPlus({ size = 14, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <line x1="8" y1="3" x2="8" y2="13" />
      <line x1="3" y1="8" x2="13" y2="8" />
    </svg>
  )
}

/** 导入/下载图标 */
export function IconImport({ size = 14, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M3 10.5v2.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2.5" />
      <polyline points="5.5 7.5 8 10 10.5 7.5" />
      <line x1="8" y1="2" x2="8" y2="10" />
    </svg>
  )
}

/** 调试/闪电图标 */
export function IconZap({ size = 14, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M8.8 1.5L2.5 9.2H7.2L6.2 14.5L13.5 6.8H8.8L8.8 1.5Z" />
    </svg>
  )
}

/** 编辑图标 */
export function IconEdit({ size = 13, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H2.5v-2.5l8.5-8.5z" />
    </svg>
  )
}

/** 删除图标 */
export function IconTrash({ size = 13, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <polyline points="3 4.5 4.5 4.5 13 4.5" />
      <path d="M5.5 4.5V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5" />
      <path d="M12 4.5v8.5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 13V4.5" />
    </svg>
  )
}

/** 搜索图标 */
export function IconSearch({ size = 13, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <circle cx="7" cy="7" r="4.5" />
      <line x1="10.5" y1="10.5" x2="13.5" y2="13.5" />
    </svg>
  )
}

/** 折叠箭头 (右) */
export function IconChevronRight({ size = 12, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <polyline points="6 3.5 10.5 8 6 12.5" />
    </svg>
  )
}

/** 折叠箭头 (下) */
export function IconChevronDown({ size = 12, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <polyline points="3.5 6 8 10.5 12.5 6" />
    </svg>
  )
}

/** 关闭图标 */
export function IconClose({ size = 14, className, style }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="currentColor"
      className={className}
      style={style}
    >
      <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
    </svg>
  )
}
