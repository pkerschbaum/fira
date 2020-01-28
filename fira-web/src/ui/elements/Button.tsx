import React from 'react';

import styles from './Button.module.css';

const Button: React.FC<React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>> = ({ children, ...props }) => {
  return (
    <button {...props} className={`${props.className} ${styles.button}`}>
      {children}
    </button>
  );
};

export default Button;
