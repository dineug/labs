import xlsx, { XLSX$Utils } from 'xlsx';

export type Columns = string[];
export type Rows = Columns[];
export type Sheet = ReturnType<XLSX$Utils['aoa_to_sheet']>;
export type ExcelData = {
  headers: string[];
  list: Rows;
  total: number;
};
export type ExcelDataAndDownload = ExcelData & { totalDownload: number };
