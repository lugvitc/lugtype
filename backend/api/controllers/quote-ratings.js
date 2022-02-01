const QuoteRatingsDAO = require("../../dao/quote-ratings");
const UserDAO = require("../../dao/user");
const MonkeyError = require("../../handlers/error");

class QuoteRatingsController {
  static async getRating(req, res) {
    const { quoteId, language } = req.query;

    return await QuoteRatingsDAO.get(parseInt(quoteId), language);
  }

  static async submitRating(req, res) {
    const { uid } = req.decodedToken;
    let { quoteId, rating, language } = req.body;

    quoteId = parseInt(quoteId);
    rating = Math.round(parseInt(rating));

    //check if user already submitted a rating
    const user = await UserDAO.getUser(uid);

    if (!user) {
      throw new MonkeyError(401, "User not found.");
    }
    const quoteRatings = user.quoteRatings;

    if (quoteRatings === undefined) quoteRatings = {};
    if (quoteRatings[language] === undefined) quoteRatings[language] = {};
    if (quoteRatings[language][quoteId] == undefined)
      quoteRatings[language][quoteId] = undefined;

    const quoteRating = quoteRatings[language][quoteId];

    let newRating;
    let update;
    if (quoteRating) {
      //user already voted for this
      newRating = rating - quoteRating;
      update = true;
    } else {
      //user has not voted for this
      newRating = rating;
      update = false;
    }

    await QuoteRatingsDAO.submit(quoteId, language, newRating, update);
    quoteRatings[language][quoteId] = rating;
    await UserDAO.updateQuoteRatings(uid, quoteRatings);

    return res.sendStatus(200);
  }
}

module.exports = QuoteRatingsController;
