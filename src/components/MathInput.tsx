import { useState, useEffect } from 'react';
import { evaluateExpression } from '../lib/utils';

export interface MathInputProps {
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
}

export function MathInput({ value, onChange, placeholder }: MathInputProps) {
  const [localValue, setLocalValue] = useState(value === 0 ? '' : value.toString());

  useEffect(() => {
    // Se o pai mudar e for diferente da representação em string avaliada
    if (value !== evaluateExpression(localValue)) {
      setLocalValue(value === 0 ? '' : value.toString());
    }
  }, [value]);

  const handleBlur = () => {
    const evaluated = evaluateExpression(localValue);
    setLocalValue(evaluated.toString());
    onChange(evaluated);
  };

  return (
    <input
      type="text"
      className="input-field"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleBlur();
        }
      }}
      placeholder={placeholder}
    />
  );
}
