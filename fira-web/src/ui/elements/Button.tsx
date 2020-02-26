import React, { useState } from 'react';

import styles from './Button.module.css';

const Button = React.forwardRef<
  HTMLButtonElement,
  {
    buttonStyle?: 'bold' | 'normal';
    buttonType?: 'primary' | 'normal';
  } & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
>(({ children, buttonStyle = 'normal', buttonType = 'normal', ...props }, ref) => {
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
      ref={ref}
      className={`${props.className} ${styles.button} ${animate && styles.animate} ${
        buttonStyle === 'normal' ? styles.styleNormal : styles.styleBold
      } ${buttonType === 'primary' && styles.typePrimary}`}
    >
      {children}
    </button>
  );
});

export default Button;
