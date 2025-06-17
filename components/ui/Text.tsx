// components/ui/Text.tsx
import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

interface CustomTextProps extends TextProps {
  variant?: 'default' | 'title' | 'subtitle' | 'caption' | 'heading1' | 'heading2' | 'body';
  children: React.ReactNode;
  className?: string;
}

// Define text styles based on variant
const textVariants = {
  default: 'text-[#7C4A1E]',
  title: 'text-2xl font-bold text-[#E86A2B]',
  subtitle: 'text-lg text-[#EBA05C]',
  caption: 'text-xs text-[#F7C873]',
  heading1: 'text-2xl font-bold text-[#E86A2B]',
  heading2: 'text-xl font-semibold text-[#E86A2B]',
  body: 'text-base text-[#7C4A1E]',
};

export const Text: React.FC<CustomTextProps> = ({ 
  variant = 'default',
  className,
  children,
  ...props 
}) => {
  return (
    <RNText
      className={`${textVariants[variant]} ${className || ''}`}
      {...props}
    >
      {children}
    </RNText>
  );
};

Text.displayName = 'Text';