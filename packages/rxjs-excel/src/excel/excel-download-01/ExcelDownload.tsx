import React, { useRef, useState } from 'react';
import xlsx from 'xlsx';

import {
  getRows,
  isLast,
  isLimitSheet,
  percent,
  toRange,
} from '@/excel/excel.util';
import { ExcelData, Rows, Sheet } from '@@types/excel';

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
  const page = useRef<number>(1);
  const totalDownload = useRef<number>(0);
  const sheet = useRef<Sheet | null>(null);
  const tempList = useRef<Rows>([]);
  const downloadFileCount = useRef<number>(0);
  const isCancel = useRef<boolean>(false);

  const [downloadPercent, setDownloadPercent] = useState<number>(0);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isCreatingFile, setIsCreatingFile] = useState<boolean>(false);

  const insertSheetData = (headers: string[], list: Rows, total: number) => {
    if (!sheet.current) {
      sheet.current = xlsx.utils.aoa_to_sheet([headers]);
    }

    const [rows, tempRows] = getRows(
      tempList.current,
      list,
      toRange(LIMIT_TUPLE, limit),
      total,
      totalDownload.current,
      downloadFileCount.current
    );

    tempList.current = tempRows;
    xlsx.utils.sheet_add_aoa(sheet.current, rows, { origin: -1 });
  };

  const downloadFile = () => {
    if (!sheet.current) return;
    const book = xlsx.utils.book_new();
    const createFilename = `${filename}_${new Date().toISOString()}`;

    xlsx.utils.book_append_sheet(book, sheet.current, 'sheet');
    xlsx.writeFile(book, `${createFilename}.xlsx`, { cellStyles: true });
  };

  const resetDownload = () => {
    sheet.current = null;
    tempList.current = [];
    page.current = 0;
    totalDownload.current = 0;
    downloadFileCount.current = 0;
    isCancel.current = false;

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
    if (isCancel.current) {
      resetDownload();
      return;
    }

    try {
      setIsDownloading(true);
      const { headers, list, total } = await onFetchRequest(page.current);

      totalDownload.current += list.length;
      page.current += 1;

      setProgress(percent(total, totalDownload.current));
      insertSheetData(headers, list, total);

      if (
        sheet.current &&
        (isLast(total, totalDownload.current) ||
          isLimitSheet(
            toRange(LIMIT_TUPLE, limit),
            totalDownload.current,
            downloadFileCount.current
          ))
      ) {
        downloadFileCount.current++;

        setIsDownloading(false);
        setIsCreatingFile(true);

        setTimeout(() => {
          try {
            downloadFile();
            sheet.current = null;

            if (totalDownload.current < total) {
              fetchData();
              setIsCreatingFile(false);
            } else {
              setCompleted();
            }
          } catch (e) {
            setError(e as Error);
          }
        }, 0);
      } else {
        fetchData();
      }
    } catch (e) {
      setError(e as Error);
    }
  };

  const handleConfirmDownload = () => {
    if (confirm('엑셀다운로드 하시겠습니까?')) {
      onStart?.();
      fetchData();
    }
  };

  const handleCancel = () => {
    isCancel.current = true;
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
