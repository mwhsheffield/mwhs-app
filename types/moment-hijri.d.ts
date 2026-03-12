declare module 'moment-hijri' {
  interface HijriMoment {
    iDate(): number;
    iMonth(): number;
    iYear(): number;
  }

  export default function moment(value?: Date | string | number): HijriMoment;
}
