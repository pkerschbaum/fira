import React, { useState } from 'react';

import styles from './Button.module.css';
import LoadingIndicator from './LoadingIndicator';

const Button = React.forwardRef<
  HTMLButtonElement,
  {
    buttonType?: 'primary' | 'secondary';
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
        buttonType === 'primary' ? styles.typePrimary : styles.typeSecondary
      }`}
    >
      <div className={styles.conditionalRenderContainer}>
        {!isLoading ? (
          <span className={styles.conditionalRenderItem}>{children}</span>
        ) : (
          <div className={styles.conditionalRenderItem}>
            <LoadingIndicator type={buttonType} />
          </div>
        )}
      </div>
    </button>
  );
});

export default Button;
