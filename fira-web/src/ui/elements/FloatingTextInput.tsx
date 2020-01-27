import React, { useState } from 'react';

import styles from './FloatingTextInput.module.css';

type FloatingLabelInputProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({ children, ...props }) => (
  <div {...props} className={`${props.className} ${styles.floatingLabelInput}`}>
    {children}
  </div>
);

type FloatingLabelInputContainerProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const FloatingLabelInputContainer: React.FC<FloatingLabelInputContainerProps> = ({
  children,
  ...props
}) => (
  <div {...props} className={`${props.className} ${styles.floatingLabelInputContainer}`}>
    {children}
  </div>
);

type FloatingLabelProps = { active: boolean } & React.DetailedHTMLProps<
  React.LabelHTMLAttributes<HTMLLabelElement>,
  HTMLLabelElement
>;

const FloatingLabel: React.FC<FloatingLabelProps> = ({ active, children, ...props }) => (
  <label
    {...props}
    className={`${props.className} ${!!active && styles.floatingLabelActive} ${
      styles.floatingLabel
    }`}
  >
    {children}
  </label>
);

type FloatingInputProps = { active: boolean } & React.DetailedHTMLProps<
  React.InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
>;

const FloatingInput: React.FC<FloatingInputProps> = ({ children, active, ...props }) => (
  <input
    {...props}
    onBlur={props.onBlur}
    className={`${props.className} ${!!active && styles.floatingInputActive} ${
      styles.floatingInput
    }`}
  >
    {children}
  </input>
);

const FloatingTextInput: React.FC<any> = ({
  id,
  label,
  type,
  ref,
  className,
  value,
  ...otherProps
}) => {
  const [active, setActive] = useState(!!value && value.length > 0);
  function onFocus(event: any) {
    setActive(true);
    if (otherProps.onFocus) {
      otherProps.onFocus(event);
    }
  }
  function onBlur(event: any) {
    if (!event.target.value || event.target.value.length === 0) {
      setActive(false);
    }
    if (otherProps.onBlur) {
      otherProps.onBlur(event);
    }
  }

  return (
    <FloatingLabelInput>
      <FloatingLabelInputContainer className={className}>
        <FloatingLabel htmlFor={id} active={active}>
          {label}
        </FloatingLabel>
        <FloatingInput
          {...otherProps}
          active={active}
          id={id}
          onBlur={onBlur}
          onFocus={onFocus}
          ref={ref}
          type={type}
        />
      </FloatingLabelInputContainer>
    </FloatingLabelInput>
  );
};

export default FloatingTextInput;
