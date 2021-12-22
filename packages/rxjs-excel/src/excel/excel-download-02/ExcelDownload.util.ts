import { Observable } from 'rxjs';
import xlsx from 'xlsx';

import { getRows, isLast, isLimitSheet } from '@/excel/excel.util';
import { ExcelData, ExcelDataAndDownload, Rows, Sheet } from '@@types/excel';

export const fromFetch = (
  onFetchRequest: (page: number) => Promise<ExcelData>
) =>
  new Observable<ExcelDataAndDownload>(subscriber => {
    let page = 1;
    let total = 0;
    let totalDownload = 0;
    let isCancel = false;

    const fetchData = async () => {
      do {
        const data = await onFetchRequest(page);
        total = data.total;
        totalDownload += data.list.length;
        page++;

        subscriber.next({
          ...data,
          totalDownload,
        });
      } while (!isCancel && totalDownload < total);

      !isCancel && subscriber.complete();
    };

    fetchData().catch(error => subscriber.error(error));

    return () => {
      isCancel = true;
    };
  });

export const toSheet =
  (limit: number) => (source$: Observable<ExcelDataAndDownload>) =>
    new Observable<Sheet>(subscriber => {
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

      return source$.subscribe({
        next({ headers, list, total, totalDownload }) {
          try {
            insertSheetData(headers, list, total, totalDownload);
          } catch (e) {
            subscriber.error(e);
          }

          if (
            sheet &&
            (isLast(total, totalDownload) ||
              isLimitSheet(limit, totalDownload, downloadFileCount))
          ) {
            downloadFileCount++;
            subscriber.next(sheet);
            sheet = null;
          }
        },
        error: e => subscriber.error(e),
        complete: () => subscriber.complete(),
      });
    });
