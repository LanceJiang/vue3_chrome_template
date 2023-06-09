import * as xlsx from 'xlsx';
import type {JSON2SheetOpts, WritingOptions, WorkBook} from 'xlsx';
import type {DefaultObject} from "@/common";
const {utils, writeFile} = xlsx;

export interface JsonToSheet<T = any> {
  data: T[];
  header?: { [key: string]: any };
  filename?: string;
  sheetName?: string;
  worksheet_cols?: { wch?: any, [key: string]: any }[];
  json2sheetOpts?: JSON2SheetOpts;
  write2excelOpts?: WritingOptions;
}

export interface JsonToMultipleSheet<T = any> {
  sheetList: JsonToSheet<T>[];
  filename?: string;
  write2excelOpts?: WritingOptions;
}

const DEF_FILE_NAME = 'excel-list.xlsx';
const DEF_SHEET_NAME = 'sheet';

/**
 * @param data source data
 * @param worksheet worksheet object
 * @param min min width
 */
function setColumnWidth(data: any[], worksheet: DefaultObject, min = 3) {
  const obj: DefaultObject = {};
  worksheet['!cols'] = [];
  data.forEach((item: DefaultObject) => {
    Object.keys(item).forEach((key) => {
      const cur = item[key];
      const length = cur?.length ?? min;
      obj[key] = Math.max(length, obj[key] ?? min);
    });
  });
  Object.keys(obj).forEach((key) => {
    worksheet['!cols'].push({
      wch: obj[key],
    });
  });
}

export function jsonToSheetXlsx<T = any>({
   data,
   header,
   filename = DEF_FILE_NAME,
   sheetName = DEF_SHEET_NAME,
   json2sheetOpts = {},
   worksheet_cols,
   write2excelOpts = {bookType: 'xlsx'},
 }: JsonToSheet<T>) {
  const arrData = [...data];
  if (header) {
    arrData.unshift(header);
    json2sheetOpts.skipHeader = true;
  }

  const worksheet = utils.json_to_sheet(arrData, json2sheetOpts);
  if (!Array.isArray(worksheet_cols) || !worksheet_cols.length) {
    setColumnWidth(arrData, worksheet);
  } else {
    worksheet['!cols'] = worksheet_cols
  }

  /* add worksheet to workbook */
  const workbook: WorkBook = {
    SheetNames: [sheetName],
    Sheets: {
      [sheetName]: worksheet,
    },
  };
  /* output format determined by filename */
  writeFile(workbook, filename, write2excelOpts);
  /* at this point, out.xlsb will have been downloaded */
}

/**
 * json导出多Sheet的Xlsx
 * @param sheetList 多sheet配置
 * @param filename 文件名(包含后缀)
 * @param write2excelOpts 文件配置
 */
export function jsonToMultipleSheetXlsx<T = any>({
   sheetList,
   filename = DEF_FILE_NAME,
   write2excelOpts = {bookType: 'xlsx'},
 }: JsonToMultipleSheet<T>) {
  const workbook: WorkBook = {
    SheetNames: [],
    Sheets: {},
  };
  sheetList.forEach((p, index) => {
    const arrData = [...p.data];
    if (p.header) {
      arrData.unshift(p.header);
      p.json2sheetOpts = p.json2sheetOpts || {};
      p.json2sheetOpts.skipHeader = true;
    }

    const worksheet = utils.json_to_sheet(arrData, p.json2sheetOpts);
    setColumnWidth(arrData, worksheet);

    p.sheetName = p.sheetName || `${DEF_SHEET_NAME}${index}`;
    workbook.SheetNames.push(p.sheetName);
    workbook.Sheets[p.sheetName] = worksheet;
  });
  writeFile(workbook, filename, write2excelOpts);
}
