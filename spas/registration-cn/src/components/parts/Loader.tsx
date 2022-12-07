import React from 'react';
import loader from '../../assets/images/oval.svg';

interface LoaderProps {
    size?: string
}

const Loader: React.FC<LoaderProps> = ({size}) => {
  return (
    <div className={`loader ${size}`}>
        <img src={loader} alt="Loading..." />
    </div>
  )
}

export default Loader