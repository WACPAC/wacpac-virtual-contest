import React, { useState, useEffect } from 'react';
import {
  TextField,
  FormHelperText,
  Box,
  Chip,
  Typography,
  Collapse,
  IconButton,
} from '@mui/material';
import { Help } from '@mui/icons-material';
import { 
  parseTimeInput, 
  validateTimeInput, 
  formatMinutesToJapanese,
  getTimeInputExamples 
} from '../../utils/timeUtils';

interface TimeInputProps {
  label?: string;
  value: number; // 分数
  onChange: (minutes: number | null) => void;
  error?: string;
  disabled?: boolean;
  minMinutes?: number;
  maxMinutes?: number;
  placeholder?: string;
  helperText?: string;
  showExamples?: boolean;
  fullWidth?: boolean;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  label = '時間（分）',
  value,
  onChange,
  error: externalError,
  disabled = false,
  minMinutes = 1,
  maxMinutes = 24 * 60,
  placeholder = '例: 120',
  helperText,
  showExamples = true,
  fullWidth = true,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [internalError, setInternalError] = useState<string | null>(null);

  // valueが変更されたときに入力値を更新
  useEffect(() => {
    if (value > 0) {
      setInputValue(value.toString());
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);

    // リアルタイムでバリデーション
    const validationError = validateTimeInput(newValue, minMinutes, maxMinutes);
    setInternalError(validationError);

    if (!validationError) {
      const minutes = parseTimeInput(newValue);
      onChange(minutes);
    } else {
      onChange(null);
    }
  };

  const handleExampleClick = (example: string) => {
    // 例から実際の入力値を抜き出す（例: "120（2時間）" -> "120"）
    const match = example.match(/^([^（]+)/);
    if (match) {
      const exampleValue = match[1];
      setInputValue(exampleValue);
      const minutes = parseTimeInput(exampleValue);
      if (minutes !== null) {
        onChange(minutes);
        setInternalError(null);
      }
    }
  };

  const displayError = externalError || internalError;
  const examples = getTimeInputExamples();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          label={label}
          value={inputValue}
          onChange={handleInputChange}
          error={!!displayError}
          disabled={disabled}
          placeholder={placeholder}
          fullWidth={fullWidth}
          variant="outlined"
          type="number"
          inputProps={{ min: minMinutes, max: maxMinutes }}
        />
        {showExamples && (
          <IconButton
            size="small"
            onClick={() => setShowHelp(!showHelp)}
            color={showHelp ? 'primary' : 'default'}
          >
            <Help />
          </IconButton>
        )}
      </Box>

      {displayError && (
        <FormHelperText error sx={{ mt: 1 }}>
          {displayError}
        </FormHelperText>
      )}

      {helperText && !displayError && (
        <FormHelperText sx={{ mt: 1 }}>
          {helperText}
        </FormHelperText>
      )}

      {/* 現在の値の表示 */}
      {value > 0 && !displayError && (
        <Box sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.secondary">
            設定値: {formatMinutesToJapanese(value)} ({value}分)
          </Typography>
        </Box>
      )}

      {/* 入力例の表示 */}
      {showExamples && (
        <Collapse in={showHelp}>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              入力例（分数）:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {examples.map((example, index) => (
                <Chip
                  key={index}
                  label={example}
                  size="small"
                  variant="outlined"
                  clickable
                  onClick={() => handleExampleClick(example)}
                  sx={{ fontSize: '0.75rem' }}
                />
              ))}
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              クリックして入力例を適用できます
            </Typography>
          </Box>
        </Collapse>
      )}
    </Box>
  );
}; 