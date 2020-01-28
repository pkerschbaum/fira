import React, { useState } from 'react';

import styles from './Button.module.css';

const Button: React.FC<{
  componentRef?: React.RefObject<HTMLButtonElement>;
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>> = ({
  componentRef,
  children,
  ...props
}) => {
  const [animate, setAnimate] = useState(false);

  function animateStart() {
    setAnimate(true);
  }

  function animateEnd() {
    setAnimate(false);
  }

  function onClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (typeof props.onClick === 'function') {
      props.onClick(e);
    }
    animateStart();
  }

  function onTransitionEnd(e: React.TransitionEvent<HTMLButtonElement>) {
    if (typeof props.onTransitionEnd === 'function') {
      props.onTransitionEnd(e);
    }
    animateEnd();
  }

  return (
    <button
      {...props}
      onClick={onClick}
      onTransitionEnd={onTransitionEnd}
      ref={componentRef}
      className={`${props.className} ${styles.button} ${animate && styles.animate}`}
    >
      {children}
    </button>
  );
};

export default Button;
