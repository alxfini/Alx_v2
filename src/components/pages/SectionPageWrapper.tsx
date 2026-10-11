import React from 'react';

interface SectionPageWrapperProps {
  title?: string;
  badge?: string;
  description?: string;
  children: React.ReactNode;
}

export const SectionPageWrapper: React.FC<SectionPageWrapperProps> = ({
  children,
}) => {
  return (
    <div className="pt-[72px] sm:pt-20 pb-4 sm:pb-6">
      <div>{children}</div>
    </div>
  );
};
