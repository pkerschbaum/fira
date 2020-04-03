import React, { useState } from 'react';

import styles from './Button.module.css';
import LoadingIndicator from './LoadingIndicator';

const Button = React.forwardRef<
  HTMLButtonElement,
  {
    buttonType?: 'primary' | 'secondary' | 'tertiary';
    isLoading?: boolean;
  } & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
>(({ children, buttonType = 'secondary', isLoading, ...props }, ref) => {
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
        buttonType === 'primary'
          ? styles.typePrimary
          : buttonType === 'secondary'
          ? styles.typeSecondary
          : styles.typeTertiary
      }`}
    >
      {!isLoading ? (
        typeof children === 'string' ? (
          <span>{children}</span>
        ) : (
          children
        )
      ) : (
        <div>
          <LoadingIndicator type={buttonType === 'tertiary' ? 'secondary' : buttonType} />
        </div>
      )}
    </button>
  );
});

export default Button;
