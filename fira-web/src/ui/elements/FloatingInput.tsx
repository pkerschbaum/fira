import React, { useState, useRef } from 'react';

import styles from './FloatingInput.module.css';

type FloatingLabelInputProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const FloatingLabelInput: React.FC<FloatingLabelInputProps> = ({ children, ...props }) => (
  <div {...props} className={`${props.className} ${styles.labelInput}`}>
    {children}
  </div>
);

type FloatingLabelInputContainerProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

const FloatingLabelInputContainer: React.FC<{
  isError?: boolean;
} & FloatingLabelInputContainerProps> = ({ isError, children, ...props }) => (
  <div
    {...props}
    className={`${props.className} ${isError && styles.inputContainerError} ${
      styles.inputContainer
    }`}
  >
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
    className={`${props.className} ${!!active && styles.labelActive} ${styles.label}`}
  >
    {children}
  </label>
);

type FloatingInputBoxProps = {
  active: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

const FloatingInputBox: React.FC<FloatingInputBoxProps> = ({
  children,
  active,
  inputRef,
  ...props
}) => (
  <input
    {...props}
    ref={inputRef}
    onBlur={props.onBlur}
    className={`${props.className} ${!!active && styles.inputActive} ${styles.input}`}
  >
    {children}
  </input>
);

type FloatingSelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

const FloatingSelect: React.FC<FloatingSelectProps> = ({ children, ...props }) => (
  <select {...props} onBlur={props.onBlur} className={`${props.className} ${styles.select}`}>
    {children}
  </select>
);

const FloatingInput: React.FC<{ [prop: string]: any } & {
  isError?: boolean;
  childType: 'input' | 'select';
}> = ({ id, label, type, className, isError, value, childType, ...otherProps }) => {
  const [active, setActive] = useState(childType !== 'input' || (!!value && value.length > 0));
  const inputRef = useRef<HTMLInputElement>(null);

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

  function onContainerClick() {
    if (childType === 'input') {
      inputRef.current!.focus();
    }
  }

  return (
    <FloatingLabelInput>
      <FloatingLabelInputContainer
        onClick={onContainerClick}
        isError={isError}
        className={className}
      >
        <FloatingLabel htmlFor={id} active={active}>
          {label}
        </FloatingLabel>
        {childType === 'input' ? (
          <FloatingInputBox
            {...otherProps}
            active={active}
            id={id}
            onBlur={onBlur}
            onFocus={onFocus}
            inputRef={inputRef}
            type={type}
          />
        ) : (
          <FloatingSelect {...otherProps}>{otherProps.children}</FloatingSelect>
        )}
      </FloatingLabelInputContainer>
    </FloatingLabelInput>
  );
};

export default FloatingInput;
