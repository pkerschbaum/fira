import React, { useState, useRef } from 'react';

import styles from './FloatingInput.module.css';
import { assertUnreachable } from '../../../util/types.util';

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
    className={`${props.className} ${!!active && styles.inputActive} ${styles.input}`}
  >
    {children}
  </input>
);

type FloatingTextareaProps = {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
} & React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;

const FloatingTextarea: React.FC<FloatingTextareaProps> = ({ children, textareaRef, ...props }) => (
  <textarea {...props} ref={textareaRef} className={`${props.className} ${styles.textarea}`}>
    {children}
  </textarea>
);

type FloatingSelectProps = React.DetailedHTMLProps<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  HTMLSelectElement
>;

const FloatingSelect: React.FC<FloatingSelectProps> = ({ children, ...props }) => (
  <select {...props} className={`${props.className} ${styles.select}`}>
    {children}
  </select>
);

const FloatingInput: React.FC<{ [prop: string]: any } & {
  isError?: boolean;
  childType: 'input' | 'textarea' | 'select';
}> = ({ id, label, type, className, isError, value, childType, ...otherProps }) => {
  const [active, setActive] = useState(childType !== 'input' || (!!value && value.length > 0));
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    } else if (childType === 'textarea') {
      textareaRef.current!.focus();
    }
  }

  return (
    <FloatingLabelInput>
      <FloatingLabelInputContainer
        onClick={onContainerClick}
        isError={isError}
        className={className}
      >
        {label && (
          <FloatingLabel htmlFor={id} active={active}>
            {label}
          </FloatingLabel>
        )}
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
        ) : childType === 'select' ? (
          <FloatingSelect {...otherProps}>{otherProps.children}</FloatingSelect>
        ) : childType === 'textarea' ? (
          <FloatingTextarea
            {...otherProps}
            id={id}
            onBlur={onBlur}
            onFocus={onFocus}
            textareaRef={textareaRef}
            onInput={function resizeOnContentChange() {
              // see https://stackoverflow.com/a/25621277/1700319
              textareaRef.current!.style.height = 'auto';
              textareaRef.current!.style.height = textareaRef.current!.scrollHeight + 'px';
            }}
          />
        ) : (
          assertUnreachable(childType)
        )}
      </FloatingLabelInputContainer>
    </FloatingLabelInput>
  );
};

export default FloatingInput;
