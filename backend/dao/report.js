import MonkeyError from "../handlers/error";
import { mongoDB } from "../init/mongodb";

const MAX_REPORTS = 1000;
const CONTENT_REPORT_LIMIT = 5;

class ReportDAO {
  static async createReport(report) {
    const reports = await mongoDB().collection("reports").find().toArray();

    if (reports.length >= MAX_REPORTS) {
      throw new MonkeyError(
        503,
        "Reports are not being accepted at this time. Please try again later."
      );
    }

    const reportAlreadyExists = reports.filter((existingReport) => {
      return existingReport.details.contentId === report.details.contentId;
    });

    if (reportAlreadyExists.length >= CONTENT_REPORT_LIMIT) {
      throw new MonkeyError(
        409,
        "A report limit for this content has been reached."
      );
    }

    await mongoDB().collection("reports").insertOne(report);
  }
}

export default ReportDAO;
