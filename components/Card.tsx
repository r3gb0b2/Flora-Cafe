
import React from 'react';

interface CardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const Card: React.FC<CardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`p-3 rounded-full ${color}`}>
        {icon}
      </div>
    </div>
  );
};

export default Card;
