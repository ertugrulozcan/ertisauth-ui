import dayjs from 'dayjs'
import 'dayjs/locale/tr'

export enum FormatType {
	Date = "Date",
	DateTime = "DateTime",
	DateTimeWithSeconds = "DateTimeWithSeconds",
	HrmShortDate = "HrmShortDate",
	HrmDate = "HrmDate",
	HrmDateTime = "HrmDateTime",
	HrmDateTimeWithSeconds = "HrmDateTimeWithSeconds",
	MongoDBDate = "MongoDBDate",
	MongoDBDateTime = "MongoDBDateTime",
	MongoDBUnifiedDateTime = "MongoDBUnifiedDateTime"
}

export class DateTimeHelper {
	public static readonly DATE_FORMAT: string = "DD.MM.yyyy"
	public static readonly DATE_TIME_FORMAT: string = "DD.MM.yyyy HH:mm"
	public static readonly DATE_TIME_FORMAT_WITH_SECONDS: string = "DD.MM.yyyy HH:mm:ss"
	public static readonly HUMAN_READABLE_SHORT_DATE_FORMAT: string = "DD MMMM"
	public static readonly HUMAN_READABLE_DATE_FORMAT: string = "DD MMMM YYYY"
	public static readonly HUMAN_READABLE_DATE_TIME_FORMAT: string = "DD MMMM YYYY HH:mm"
	public static readonly HUMAN_READABLE_DATE_TIME_FORMAT_WITH_SECONDS: string = "DD MMMM YYYY HH:mm:ss"
	public static readonly MONGODB_DATE_FORMAT: string = "YYYY-MM-DD"
	public static readonly MONGODB_DATE_TIME_FORMAT: string = "YYYY-MM-DD HH:mm:ss"
	public static readonly MONGODB_UNIFIED_DATE_TIME_FORMAT: string = "YYYY-MM-DDTHH:mm:ss"

	static format(date: Date | null | undefined, formatType?: FormatType, locale?: string): string {
		const selectedLocale: "en" | "tr" = (locale === "tr" || locale === "tr-TR") ? "tr" : "en"
		dayjs.locale(selectedLocale)
		return date ? dayjs(date).format(DateTimeHelper.getFormat(formatType)) : ""
	}

	static toString(date: Date | null | undefined, format: string, locale?: string): string {
		const selectedLocale: "en" | "tr" = (locale === "tr" || locale === "tr-TR") ? "tr" : "en"
		dayjs.locale(selectedLocale)
		return date ? dayjs(date).format(format) : ""
	}

	private static getFormat(formatType: FormatType | undefined): string {
		if (formatType) {
			switch (formatType) {
				case FormatType.Date: return DateTimeHelper.DATE_FORMAT
				case FormatType.DateTime: return DateTimeHelper.DATE_TIME_FORMAT
				case FormatType.DateTimeWithSeconds: return DateTimeHelper.DATE_TIME_FORMAT_WITH_SECONDS
				case FormatType.HrmShortDate: return DateTimeHelper.HUMAN_READABLE_SHORT_DATE_FORMAT
				case FormatType.HrmDate: return DateTimeHelper.HUMAN_READABLE_DATE_FORMAT
				case FormatType.HrmDateTime: return DateTimeHelper.HUMAN_READABLE_DATE_TIME_FORMAT
				case FormatType.HrmDateTimeWithSeconds: return DateTimeHelper.HUMAN_READABLE_DATE_TIME_FORMAT_WITH_SECONDS
				case FormatType.MongoDBDate: return DateTimeHelper.MONGODB_DATE_FORMAT
				case FormatType.MongoDBDateTime: return DateTimeHelper.MONGODB_DATE_TIME_FORMAT
				case FormatType.MongoDBUnifiedDateTime: return DateTimeHelper.MONGODB_UNIFIED_DATE_TIME_FORMAT
				default: return DateTimeHelper.DATE_TIME_FORMAT
			}
		}

		return DateTimeHelper.DATE_TIME_FORMAT
	}

	static toUnixTimeStamp(date: string | Date | undefined | null) {
		if (date) {
			return new Date(date).getTime()
		}
		else {
			return new Date().getTime()
		}
	}
}