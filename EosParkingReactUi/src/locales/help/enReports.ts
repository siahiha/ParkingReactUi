import type { HelpArticle, HelpEntry } from '../../features/help/helpTypes';

const actions: HelpEntry[] = [
  ['Show report', 'Creates a fresh result with the current filters. Wait for the preview.'],
  ['Show report again', 'Opens the existing result. Run the report again for new data or new filters.'],
  ['Print and export', 'Use the available preview tools. On narrow screens scroll the toolbar horizontally.'],
  ['Close preview', 'Returns to the same page filters. The prepared result remains available while you stay on that page.'],
];
const problems: HelpEntry[] = [
  ['No results', 'Check parking, dates and active filters. Zero records is not necessarily an error.', 'empty report nothing found'],
  ['Preview does not open', 'Read the page message and check required filters.'],
  ['Print or export is missing', 'Check the preview toolbar and scroll it horizontally on a small screen. For printing problems check the print window and chosen printer.'],
];
const steps = ['Select the report and intended information scope.', 'Complete available filters and choose Show report.', 'Check the title, dates and result, then print or export if needed.'];

export const enReports = {
  memberReports: {
    title: 'Member and membership status reports', intro: 'Review all members or those with active or inactive memberships. Choose the report matching your question.', steps,
    fields: [['Registered From / To', 'The registration period to review. The end must not precede the start.'], ['Membership type', 'Limits the report to the chosen plan. Use All for a broader search.'], ['Active / inactive', 'The chosen report determines the membership status included. This differs from an enabled application account.'], ['Record count', 'The number of rows in the prepared result. Check the report scope before printing.']], actions, problems,
  },
  trafficReports: {
    title: 'Traffic and stay duration reports', intro: 'Choose entrance and exit for vehicle detail, daily door counts for volume, or average parking time for stay duration.', steps,
    fields: [['From / To date', 'The report period; check both against the intended days.'], ['Plate', 'Where available, enter a complete plate or leave empty to include all plates.'], ['Plate format', 'Chooses car or motorcycle input format. It differs from the vehicle type filter.'], ['Member code', 'Limits the report to the person. Do not enter the card number here.'], ['Vehicle type', 'Limits the report to a vehicle group. Use All for a broad search.'], ['Only present', 'Includes vehicles without a registered exit.'], ['With image', 'Requests available traffic images in the detail report. Some records may have none.'], ['Doors', 'Select doors for the daily count report. This option appears only in the relevant report.']], actions, problems,
  },
  financialReports: {
    title: 'Parking and member financial reports', intro: 'Choose parking income, monthly comparison, member account activity, user performance or membership sales. Reports do not record a new payment.', steps,
    fields: [['From / To date', 'The financial reporting period.'], ['Member', 'Required for member account activity; select one person.'], ['Member code', 'Limits membership sales to the specified member code.'], ['Membership type', 'Limits sales to a plan; All removes this restriction.'], ['User', 'Choose the person in user performance. Current user means the account you signed in with.']], actions,
    problems: [...problems, ['An income report is missing', 'Check commercial parking status and report permission. Member account activity and membership sales do not share the same commercial condition as parking income.']],
  },
  managementReports: {
    title: 'Management and income comparison reports', intro: 'Compare parkings or years and review user performance or public parking income. Available filters differ by report.', steps,
    fields: [['Parkings', 'Select the parkings to compare. Reports requiring this selection need at least one parking.'], ['Year / years', 'Choose one year for monthly comparison or multiple years for the relevant comparison.'], ['From / To date', 'The review period in user performance and public parking income.'], ['User', 'Choose a person or All users for performance.'], ['Member code', 'Limits public parking income to a specific member.'], ['Plate', 'Where available, enter a complete plate or leave empty to include all.'], ['Vehicle type', 'Select the vehicle group in reports with this filter.']], actions, problems,
  },
  cargoReport: {
    title: 'Cargo details report', intro: 'Review registered cargo by date, vehicle, driver, goods and route.', steps,
    fields: [['From / To date', 'The cargo search period.'], ['Plate', 'Enter a complete plate for one vehicle or leave empty for all.'], ['Driver', 'Select a driver or All to remove this restriction.'], ['Merchandise', 'Select the goods to review.'], ['Origin', 'The intended starting location.'], ['Destination', 'The intended delivery location.'], ['Attachments', 'Chooses output with or without attachments. Availability depends on the recorded information.']], actions, problems,
  },
} satisfies Record<string, HelpArticle>;
