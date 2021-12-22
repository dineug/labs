// import ExcelDownload from '@/excel/excel-download-01/ExcelDownload';
// import ExcelDownload from '@/excel/excel-download-02/ExcelDownload';
import ExcelDownload from '@/excel/excel-download-03/ExcelDownload';
import { delay, generateData } from '@/helpers/mock';

const TOTAL = 30_000;
const SIZE = 300;
const DELAY = 200;
const iteratorData = generateData(SIZE, TOTAL);

function Excel() {
  const onStart = () => {
    console.log('onStart');
  };

  const onFetchRequest = async (page: number) => {
    console.log('onFetchRequest', page);
    await delay(DELAY);
    const { value } = iteratorData.next();
    return value
      ? value
      : {
          headers: [],
          list: [],
          total: TOTAL,
        };
  };

  const onProgress = (percent: number) => {
    console.log('onProgress', percent);
  };

  const onCompleted = () => {
    console.log('onCompleted');
  };

  const onError = (error: Error) => {
    console.log('onError', error);
  };

  return (
    <ExcelDownload
      onFetchRequest={onFetchRequest}
      onStart={onStart}
      onProgress={onProgress}
      onCompleted={onCompleted}
      onError={onError}
    />
  );
}

export default Excel;
