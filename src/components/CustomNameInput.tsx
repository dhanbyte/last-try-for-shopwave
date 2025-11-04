'use client';

import { useState } from 'react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Palette, Type } from 'lucide-react';

interface CustomNameInputProps {
  onCustomNameChange: (name: string) => void;
  maxLength?: number;
  placeholder?: string;
}

export default function CustomNameInput({ 
  onCustomNameChange, 
  maxLength = 20, 
  placeholder = "Enter your custom name/text" 
}: CustomNameInputProps) {
  const [customName, setCustomName] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(0, maxLength);
    setCustomName(value);
    onCustomNameChange(value);
  };

  return (
    <Card className="border-2 border-dashed border-blue-200 bg-blue-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg text-blue-800">
          <Palette className="w-5 h-5" />
          Customize Your Product
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="customName" className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Type className="w-4 h-4" />
            Add Your Name/Text
          </Label>
          <Input
            id="customName"
            type="text"
            value={customName}
            onChange={handleChange}
            placeholder={placeholder}
            maxLength={maxLength}
            className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
          />
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>This will be printed on your product</span>
            <span>{customName.length}/{maxLength}</span>
          </div>
        </div>
        
        {customName && (
          <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Preview:</p>
            <p className="font-semibold text-blue-800 text-lg">"{customName}"</p>
          </div>
        )}
        
        <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">
          <strong>Note:</strong> Custom products take 3-5 additional business days for processing.
        </div>
      </CardContent>
    </Card>
  );
}