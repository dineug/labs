import React from 'react';
import xlsx from 'xlsx';

import { getRows, isLast, isLimitSheet } from '@/excel/excel.util';
import { ExcelData, ExcelDataAndDownload, Rows, Sheet } from '@@types/excel';

type Iter<T> = AsyncGenerator<T> | Generator<T>;

export const pipe =
  (...operators: Array<(source: any) => Iter<any>>) =>
  (initSource: any): Iter<any> =>
    operators.reduce((source, operator) => operator(source), initSource);

export async function* fromFetch({
  onFetchRequest,
  cancel,
}: {
  onFetchRequest: (page: number) => Promise<ExcelData>;
  cancel: React.RefObject<boolean>;
}): Iter<ExcelDataAndDownload> {
  let page = 1;
  let total = 0;
  let totalDownload = 0;

  do {
    const data = await onFetchRequest(page);
    total = data.total;
    totalDownload += data.list.length;
    page++;

    yield {
      ...data,
      totalDownload,
    };
  } while (!cancel.current && totalDownload < total);
}

export const toSheet = (limit: number) =>
  async function* (source: Iter<ExcelDataAndDownload>) {
    let sheet: Sheet | null = null;
    let tempList: Rows = [];
    let downloadFileCount = 0;

    const insertSheetData = (
      headers: string[],
      list: Rows,
      total: number,
      totalDownload: number
    ) => {
      if (!sheet) {
        sheet = xlsx.utils.aoa_to_sheet([headers]);
      }

      const [rows, tempRows] = getRows(
        tempList,
        list,
        limit,
        total,
        totalDownload,
        downloadFileCount
      );

      tempList = tempRows;
      xlsx.utils.sheet_add_aoa(sheet, rows, { origin: -1 });
    };

    for await (const { headers, list, total, totalDownload } of source) {
      try {
        insertSheetData(headers, list, total, totalDownload);
      } catch (e) {
        throw e;
      }

      if (
        sheet &&
        (isLast(total, totalDownload) ||
          isLimitSheet(limit, totalDownload, downloadFileCount))
      ) {
        downloadFileCount++;
        yield sheet;
        sheet = null;
      }
    }
  };

export const tap = (effect: (value: any) => void) =>
  async function* (source: Iter<any>) {
    for await (const value of source) {
      effect(value);
      yield value;
    }
  };
