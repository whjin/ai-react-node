import React, { useContext } from 'react';
import { appContext } from '../../main';

interface RobotProps {
  id: string | number;
  name: string;
  email: string;
}

const Robot: React.FC<RobotProps> = ({ id, name, email }) => {
  const value = useContext(appContext);
  return (
    <li>
      <img src={`https://robohash.org/${id}`} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
      <p>作者：{value.username}</p>
    </li>
  );
};

export default Robot;
