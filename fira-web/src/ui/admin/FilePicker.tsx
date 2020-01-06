import React, { useRef } from 'react';

type FilePickerProps = {
  buttonText: string;
  onFileInput: (file: File) => void;
};

const FilePicker: React.FC<FilePickerProps> = ({ buttonText, onFileInput }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  function onFileInputChange() {
    if (fileInputRef.current!.files?.length) {
      onFileInput(fileInputRef.current!.files[0]);
      fileInputRef.current!.value = '';
    }
  }

  return (
    <>
      <input type="button" value={buttonText} onClick={() => fileInputRef.current!.click()} />
      <input
        ref={fileInputRef}
        type="file"
        multiple={false}
        accept=".tsv"
        style={{ display: 'none' }}
        onChange={onFileInputChange}
      />
    </>
  );
};

export default FilePicker;
