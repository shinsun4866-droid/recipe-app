
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 border-4 border-t-4 border-t-emerald-500 border-gray-200 rounded-full animate-spin"></div>
      <p className="mt-4 text-lg font-semibold text-gray-700">금복상회 수석 셰프가 레시피를 구상 중입니다... 🧑‍🍳</p>
    </div>
  );
};

export default LoadingSpinner;
