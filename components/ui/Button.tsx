// components/ui/Button.tsx
import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, ActivityIndicator } from 'react-native';
import { Text } from './Text';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  // Determine button styles based on variant
  const buttonVariantClasses = {
    primary: 'bg-[#E86A2B]',
    secondary: 'bg-[#F7C873]',
    outline: 'border border-[#E86A2B]',
  };

  // Determine button size styles
  const buttonSizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  // Determine text styles based on variant
  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-[#7C4A1E]',
    outline: 'text-[#E86A2B]',
  };

  return (
    <TouchableOpacity
      className={`
        rounded-lg items-center justify-center
        ${buttonVariantClasses[variant]}
        ${buttonSizeClasses[size]}
        ${disabled ? 'opacity-50' : ''}
        ${className || ''}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#22C55E' : 'white'} />
      ) : (
        <Text className={`font-medium ${textVariantClasses[variant]}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};