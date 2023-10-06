/**
 * Returns a number 1-366 representing how far through the year the date is.
 * Ideally port this to Temporal when it comes out.
 *
 * Credit to https://stackoverflow.com/a/26426761
 */
export function getDayOfYear(date: Date): number {
	// Get Day of Year
	var dayCount = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
	var mn = date.getMonth();
	var dn = date.getDate();
	var dayOfYear = dayCount[mn] + dn;
	if (mn > 1 && isLeapYear(date)) dayOfYear++;
	return dayOfYear;
}

function isLeapYear(date: Date): boolean {
	const year = date.getFullYear();
	if ((year & 3) != 0) return false;
	return year % 100 != 0 || year % 400 == 0;
}
