import React, { useRef, useState } from 'react';
import xlsx from 'xlsx';
import { Sheet, ExcelData } from '@@types/excel';
import { percent, toRange } from '@/excel/excel.util';
import {
  fromFetch,
  toSheet,
} from '@/excel/excel-download-02/ExcelDownload.util';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

type Props = {
  filename?: string;
  limit?: number;
  onFetchRequest: (page: number) => Promise<ExcelData>;
  onStart?: () => void;
  onProgress?: (percent: number) => void;
  onCompleted?: () => void;
  onError?: (error: Error) => void;
};

const MAX_LIMIT = 10_000;
const MIN_LIMIT = 1000;
const LIMIT_TUPLE: [number, number] = [MIN_LIMIT, MAX_LIMIT];

const ExcelDownload: React.FC<Props> = ({
  filename = 'excel_download_file',
  limit = MAX_LIMIT,
  onFetchRequest,
  onStart,
  onProgress,
  onCompleted,
  onError,
}) => {
  const cancel = useRef<Subscription | null>(null);

  const [downloadPercent, setDownloadPercent] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);

  const downloadFile = (sheet: Sheet) => {
    const book = xlsx.utils.book_new();
    const createFilename = `${filename}_${new Date().toISOString()}`;

    xlsx.utils.book_append_sheet(book, sheet, 'sheet');
    xlsx.writeFile(book, `${createFilename}.xlsx`, { cellStyles: true });
  };

  const resetDownload = () => {
    cancel.current = null;
    setDownloadPercent(0);
    setIsDownloading(false);
    setIsCreatingFile(false);
  };

  const setProgress = (percent: number) => {
    setDownloadPercent(percent);
    onProgress?.(percent);
  };

  const setCompleted = () => {
    setProgress(100);
    onCompleted?.();
    resetDownload();
  };

  const setError = (e: Error) => {
    resetDownload();
    onError?.(e);
  };

  const fetchData = async () => {
    setIsDownloading(true);

    cancel.current = fromFetch(onFetchRequest)
      .pipe(
        tap(({ total, totalDownload }) =>
          setProgress(percent(total, totalDownload))
        ),
        toSheet(toRange(LIMIT_TUPLE, limit))
      )
      .subscribe({
        next(sheet) {
          setIsDownloading(false);
          setIsCreatingFile(true);

          setTimeout(() => {
            try {
              downloadFile(sheet);
              setIsDownloading(true);
              setIsCreatingFile(false);
            } catch (e) {
              cancel.current?.unsubscribe();
              setError(e as Error);
            }
          }, 0);
        },
        error: setError,
        complete: () => setTimeout(setCompleted, 0),
      });
  };

  const handleConfirmDownload = () => {
    if (confirm('엑셀다운로드 하시겠습니까?')) {
      onStart?.();
      fetchData();
    }
  };

  const handleCancel = () => {
    cancel.current?.unsubscribe();
    resetDownload();
  };

  return (
    <>
      <button
        style={{ width: '150px' }}
        disabled={isDownloading || (!isDownloading && isCreatingFile)}
        onClick={handleConfirmDownload}
      >
        {isCreatingFile ? '엑셀생성' : '엑셀다운로드'}
        {(isDownloading || isCreatingFile) && `(${downloadPercent}%)`}
      </button>
      {isDownloading && (
        <button
          style={{ marginLeft: '4px' }}
          disabled={!isDownloading || (!isDownloading && isCreatingFile)}
          onClick={handleCancel}
        >
          다운로드취소
        </button>
      )}
    </>
  );
};

export default ExcelDownload;
