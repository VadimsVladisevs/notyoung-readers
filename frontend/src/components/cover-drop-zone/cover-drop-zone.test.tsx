import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CoverDropZone from './cover-drop-zone';
import { COVER_MAX_BYTES } from '../../utils/cover';

const DROP_HINT = /Перетащите сюда обложку/;

const jpeg = (name = 'cover.jpg', size = 10) => new File([new Uint8Array(size)], name, { type: 'image/jpeg' });

/** The zone with its file kept in state, as the dialogs use it. */
const Harness: React.FC<{ onChange?: (file: File | null) => void; currentSrc?: string }> = ({ onChange, currentSrc }) => {
  const [file, setFile] = useState<File | null>(null);
  return (
    <CoverDropZone
      file={file}
      currentSrc={currentSrc}
      onChange={(next) => {
        setFile(next);
        onChange?.(next);
      }}
    />
  );
};

const drop = (file: File) => fireEvent.drop(screen.getByRole('button', { name: DROP_HINT }), { dataTransfer: { files: [file] } });

describe('CoverDropZone', () => {
  it('shows no preview until a file is chosen', () => {
    render(<Harness />);

    expect(screen.getByRole('button', { name: DROP_HINT })).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('shows the current cover while no file is chosen', () => {
    render(<Harness currentSrc="images/old.jpg" />);

    expect(screen.getByRole('img', { name: 'Обложка' })).toHaveAttribute('src', 'images/old.jpg');
    expect(screen.queryByRole('button', { name: 'Убрать выбранный файл' })).not.toBeInTheDocument();
  });

  it('takes a file picked with the file chooser and previews it', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} currentSrc="images/old.jpg" />);
    const file = jpeg();

    await user.upload(screen.getByLabelText('Файл обложки'), file);

    expect(onChange).toHaveBeenCalledWith(file);
    expect(screen.getByRole('img', { name: 'Обложка' })).toHaveAttribute('src', expect.stringMatching(/^blob:/));
  });

  it('takes a dropped file', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const file = jpeg();

    drop(file);

    expect(onChange).toHaveBeenCalledWith(file);
    expect(screen.getByRole('img', { name: 'Обложка' })).toBeInTheDocument();
  });

  it('rejects a file that is not a JPEG', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    drop(new File(['x'], 'cover.png', { type: 'image/png' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Нужен файл JPEG');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('rejects a file over 2 MB', () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    drop(jpeg('big.jpg', COVER_MAX_BYTES + 1));

    expect(screen.getByRole('alert')).toHaveTextContent('Файл больше 2 МБ');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes the chosen file, back to the current cover', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Harness onChange={onChange} currentSrc="images/old.jpg" />);
    drop(jpeg());

    await user.click(screen.getByRole('button', { name: 'Убрать выбранный файл' }));

    expect(onChange).toHaveBeenLastCalledWith(null);
    expect(screen.getByRole('img', { name: 'Обложка' })).toHaveAttribute('src', 'images/old.jpg');
  });
});
