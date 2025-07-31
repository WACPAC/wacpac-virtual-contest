/**
 * 時間関連のユーティリティ関数
 */

/**
 * 分を時間:分の形式に変換する
 * @param totalMinutes 総分数
 * @returns "H:MM" 形式の文字列
 */
export const formatSecondsToHMS = (totalSeconds: number): string => {
  // const hours = Math.floor(totalSeconds / 3600);
  // const minutes = Math.floor((totalSeconds % 3600) / 60);
  // const seconds = totalSeconds % 60;
  // return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

/**
 * 分を日本語の時間形式に変換する
 * @param totalMinutes 総分数
 * @returns "X時間Y分" 形式の文字列
 */
export const formatMinutesToJapanese = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  if (hours > 0 && minutes > 0) {
    return `${hours}時間${minutes}分`;
  } else if (hours > 0) {
    return `${hours}時間`;
  } else {
    return `${minutes}分`;
  }
};

/**
 * 数字の文字列を分数に変換する（数字のみ受け付け）
 * @param input 入力文字列
 * @returns 分数 (無効な場合は null)
 */
export const parseTimeInput = (input: string): number | null => {
  if (!input || input.trim() === '') return null;
  
  const trimmed = input.trim();
  
  // 数字のみの場合（分として扱う）
  if (/^\d+$/.test(trimmed)) {
    const minutes = parseInt(trimmed, 10);
    return isNaN(minutes) ? null : minutes;
  }
  
  return null;
};

/**
 * 時間入力の妥当性をチェックし、エラーメッセージを返す
 * @param input 入力文字列
 * @param minMinutes 最小分数
 * @param maxMinutes 最大分数
 * @returns エラーメッセージ (有効な場合は null)
 */
export const validateTimeInput = (
  input: string, 
  minMinutes: number = 1, 
  maxMinutes: number = 24 * 60
): string | null => {
  if (!input || input.trim() === '') {
    return '時間を入力してください';
  }
  
  const minutes = parseTimeInput(input);
  
  if (minutes === null) {
    return '数字で分数を入力してください（例: 120）';
  }
  
  if (minutes < minMinutes) {
    return `時間は${minMinutes}分以上である必要があります`;
  }
  
  if (minutes > maxMinutes) {
    return `時間は${maxMinutes}分以下である必要があります`;
  }
  
  return null;
};

/**
 * 時間入力のサンプル例を取得する
 * @returns サンプル文字列の配列
 */
export const getTimeInputExamples = (): string[] => [
  '120（2時間）',
  '90（1時間30分）',
  '60（1時間）',
  '180（3時間）',
  '240（4時間）',
  '300（5時間）'
]; 