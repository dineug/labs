import { round } from 'lodash-es';

import { Rows } from '@@types/excel';

export const isLast = (total: number, totalDownload: number) =>
  total <= totalDownload;

export const isLimitSheet = (
  limit: number,
  totalDownload: number,
  downloadFileCount: number
) => limit * (downloadFileCount + 1) <= totalDownload;

export const percent = (total: number, totalDownload: number) =>
  round((totalDownload / total) * 100, 1);

const getOverCount = (
  limit: number,
  totalDownload: number,
  downloadFileCount: number
) => totalDownload - limit * (downloadFileCount + 1);

export function getRows(
  tempList: Rows,
  list: Rows,
  limit: number,
  total: number,
  totalDownload: number,
  downloadFileCount: number
): [Rows, Rows] {
  const newList: Rows = [];
  let newTempList: Rows = [...tempList];

  if (isLast(total, totalDownload)) {
    newList.push(...tempList, ...list);
  } else if (isLimitSheet(limit, totalDownload, downloadFileCount)) {
    const overCount = getOverCount(limit, totalDownload, downloadFileCount);

    if (overCount > 0) {
      const targetCount = list.length - overCount;

      newList.push(...list.slice(0, targetCount));
      newTempList = list.slice(targetCount);
    } else {
      newList.push(...list);
      newTempList = [];
    }
  } else {
    if (tempList.length) {
      newList.push(...tempList, ...list);
      newTempList = [];
    } else {
      newList.push(...list);
    }
  }

  return [newList, newTempList];
}

export const toRange = ([min, max]: [number, number], n: number) =>
  Math.min(max, Math.max(min, n));
