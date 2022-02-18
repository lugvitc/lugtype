const { v4: uuidv4 } = require("uuid");
const ReportDAO = require("../../dao/report");
const UserDAO = require("../../dao/user");
const MonkeyError = require("../../handlers/error");
const Captcha = require("../../handlers/captcha");
const Logger = require("../../handlers/logger");
const { MonkeyResponse } = require("../../handlers/response");

class QuotesController {
  static async reportQuote(req, res) {
    const { uid } = req.ctx.decodedToken;

    const user = await UserDAO.getUser(uid);
    if (user.cannotReport) {
      throw new MonkeyError(403, "You don't have permission to do this.");
    }

    const { quoteId, quoteLanguage, reason, comment, captcha } = req.body;

    if (!(await Captcha.verify(captcha))) {
      throw new MonkeyError(400, "Captcha check failed.");
    }

    const newReport = {
      id: uuidv4(),
      type: "quote",
      timestamp: new Date().getTime(),
      uid,
      details: {
        contentId: `${quoteLanguage}-${quoteId}`,
        reason,
        comment,
      },
    };

    await ReportDAO.createReport(newReport);

    Logger.log("report_created", {
      type: newReport.type,
      details: newReport.details,
    });

    return new MonkeyResponse("Quote reported successfully");
  }
}

module.exports = QuotesController;
