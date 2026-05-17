import React from 'react';
import './index.scss';

interface RobotProps {
  id: string | number;
  name: string;
  email: string;
}

const Robot: React.FC<RobotProps> = ({ id, name, email }) => {
  return (
    <li>
      <img src={`https://robohash.org/${id}`} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
    </li>
  );
};

export default Robot;
