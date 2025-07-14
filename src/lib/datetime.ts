export class Datetime {

    getCurrentDateTime(dateSeparateSymbol: string = '-') {
        const dateTime = new Date();
        const dateDay = this.formatWithTwoDigits(String(dateTime.getDate()));
        const month = this.formatWithTwoDigits(String(dateTime.getMonth() + 1));

        const hour = this.formatWithTwoDigits(String(dateTime.getHours()));
        const minutes = this.formatWithTwoDigits(String(dateTime.getMinutes()));
        const seconds = this.formatWithTwoDigits(String(dateTime.getSeconds()));

        return `${dateTime.getFullYear()}${dateSeparateSymbol}${month}${dateSeparateSymbol}${dateDay} ${hour}:${minutes}:${seconds}`;
    }

    private formatWithTwoDigits(value: number | string) {
        if (+value < 10) {
            return `0${value}`;
        }
        return String(value);
    }

    /**
     * Add specific days count to select date or now date
     * @param days add days in select date
     * @param customDate Specify date if use select date
     */
    addDays(days: number, date: string, customDate: string = '') {
        const date_ = customDate !== '' ? new Date(customDate) : new Date(date);
        date_.setDate(date_.getDate() + days);
        return date_.toISOString();
    }


}