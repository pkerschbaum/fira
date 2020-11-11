import React from 'react';
import { FormControlLabel, Switch, SwitchProps } from '@material-ui/core';
import { SerializedStyles } from '@emotion/core';
import { Field } from 'formik';

type SwitchInputProps = {
  label: string;
  name?: string;
  switchProps?: Exclude<SwitchProps, 'name'>;
  cssClasses?: { label?: SerializedStyles };
};

const SwitchInput: React.FC<SwitchInputProps> = ({ label, name, switchProps, cssClasses }) => {
  const renderSwitch = (controlValues?: { field: any }) => (
    <FormControlLabel
      label={label}
      css={cssClasses?.label}
      control={<Switch {...controlValues?.field} {...switchProps} />}
    />
  );

  return name === undefined ? (
    renderSwitch()
  ) : (
    <Field type="checkbox" name={name}>
      {({ field }: any) => renderSwitch({ field })}
    </Field>
  );
};

export default SwitchInput;
