import React from 'react';
import { SerializedStyles } from '@emotion/core';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectProps,
  FormHelperText,
} from '@material-ui/core';
import { Field } from 'formik';

type SelectInputProps<ItemValue extends string | number | undefined | null> = SelectProps & {
  label?: string;
  availableValues: Array<{
    value: ItemValue;
    label: string;
  }>;
  defaultValue?: ItemValue;
  onValueChange?: (val: ItemValue) => void;
  cssClasses?: {
    root?: SerializedStyles | SerializedStyles[];
    input?: SerializedStyles | SerializedStyles[];
  };
};

function SelectInput<ItemValue extends string | number | undefined | null>({
  name,
  label,
  availableValues,
  onValueChange,
  cssClasses,
  ...otherProps
}: SelectInputProps<ItemValue>): React.ReactElement<SelectInputProps<ItemValue>> {
  const renderSelect = (controlValues?: { field: any; error?: string }) => (
    <FormControl
      variant="outlined"
      css={cssClasses?.root}
      error={controlValues?.error !== undefined}
    >
      {label && <InputLabel>{label}</InputLabel>}
      <Select
        label={label}
        name={name}
        onChange={
          onValueChange === undefined
            ? undefined
            : (e) => onValueChange(e.target.value as ItemValue)
        }
        css={cssClasses?.input}
        {...otherProps}
        {...controlValues?.field}
      >
        {availableValues.map((availableValue) => (
          <MenuItem
            key={availableValue.value ?? undefined}
            value={availableValue.value ?? undefined}
          >
            {availableValue.label}
          </MenuItem>
        ))}
      </Select>
      {controlValues?.error !== undefined && <FormHelperText>{controlValues.error}</FormHelperText>}
    </FormControl>
  );

  return name === undefined ? (
    renderSelect()
  ) : (
    <Field name={name}>
      {({ field, meta }: any) => {
        const showError = !!(meta.touched && meta.error);

        return renderSelect({ field, error: !showError ? undefined : meta.error });
      }}
    </Field>
  );
}

export default SelectInput;
