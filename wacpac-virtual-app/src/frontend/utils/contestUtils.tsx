import React from 'react';
import { Chip } from '@mui/material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * コンテストのステータスに応じたChipコンポーネントを返す
 * @param status コンテストのステータス
 * @param startTime コンテストの開始時刻（オプション）
 * @param size Chipのサイズ（デフォルト: 'small'）
 * @returns ステータスに応じたChipコンポーネント
 */
export const getStatusChip = (
  status: string, 
  startTime?: string, 
  size: 'small' | 'medium' = 'small'
): React.ReactElement => {
  const now = new Date();
  
  switch (status) {
    case 'before':
      return <Chip label="開始前" color="default" size={size} />;
    case 'running':
      if (startTime) {
        const contestStartTime = new Date(startTime);
        if (now < contestStartTime) {
          // 開始時刻が未来の場合は「開始予定」
          const timeString = format(contestStartTime, 'HH:mm', { locale: ja });
          return <Chip label={`開始予定: ${timeString}`} color="info" size={size} />;
        } else {
          // 開始時刻を過ぎている場合は「実行中」
          return <Chip label="実行中" color="primary" size={size} />;
        }
      }
      return <Chip label="実行中" color="primary" size={size} />;
    case 'after':
      return <Chip label="終了" color="secondary" size={size} />;
    default:
      return <Chip label="不明" color="error" size={size} />;
  }
};

/**
 * コンテストのステータスラベルを文字列として返す
 * @param status コンテストのステータス
 * @param startTime コンテストの開始時刻（オプション）
 * @returns ステータスラベル
 */
export const getStatusLabel = (status: string, startTime?: string): string => {
  const now = new Date();
  
  switch (status) {
    case 'before':
      return '開始前';
    case 'running':
      if (startTime) {
        const contestStartTime = new Date(startTime);
        if (now < contestStartTime) {
          return '開始予定';
        } else {
          return '実行中';
        }
      }
      return '実行中';
    case 'after':
      return '終了';
    default:
      return '不明';
  }
};

/**
 * ステータスに応じた色を返す
 * @param status コンテストのステータス
 * @returns MUIのカラー
 */
export const getStatusColor = (status: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' => {
  switch (status) {
    case 'before':
      return 'default';
    case 'running':
      return 'primary';
    case 'after':
      return 'secondary';
    default:
      return 'error';
  }
};
