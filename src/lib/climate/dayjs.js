import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import utc from 'dayjs/plugin/utc';

dayjs.extend(dayOfYear);
dayjs.extend(LocalizedFormat);
dayjs.extend(utc);

export default dayjs;
