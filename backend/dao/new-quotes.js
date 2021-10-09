const MonkeyError = require("../handlers/error");
const { mongoDB } = require("../init/mongodb");
const fs = require("fs");
const simpleGit = require("simple-git");
const path = require("path");
const git = simpleGit(path.join(__dirname, "../../../monkeytype-new-quotes"));
const stringSimilarity = require("string-similarity");
const { ObjectID } = require("mongodb");

class NewQuotesDAO {
  static async add(text, source, language, uid) {
    let quote = {
      text: text,
      source: source,
      language: language.toLowerCase(),
      submittedBy: uid,
      timestamp: Date.now(),
      approved: false,
    };
    //check for duplicate first
    const fileDir = path.join(
      __dirname,
      `../monkeytype-new-quotes/static/quotes/${language}.json`
    );
    let duplicateId = -1;
    let similarityScore = -1;
    if (fs.existsSync(fileDir)) {
      // let quoteFile = fs.readFileSync(fileDir);
      // quoteFile = JSON.parse(quoteFile.toString());
      // quoteFile.quotes.every((old) => {
      //   if (stringSimilarity.compareTwoStrings(old.text, quote.text) > 0.9) {
      //     duplicateId = old.id;
      //     similarityScore = stringSimilarity.compareTwoStrings(
      //       old.text,
      //       quote.text
      //     );
      //     return false;
      //   }
      //   return true;
      // });
    } else {
      return { languageError: 1 };
    }
    if (duplicateId != -1) {
      return { duplicateId, similarityScore };
    }
    return await mongoDB().collection("new-quotes").insertOne(quote);
  }

  static async get() {
    return await mongoDB()
      .collection("new-quotes")
      .find({ approved: false })
      .sort({ timestamp: 1 })
      .limit(10)
      .toArray();
  }

  static async approve(quoteId, editQuote, editSource) {
    //check mod status
    let quote = await mongoDB()
      .collection("new-quotes")
      .findOne({ _id: ObjectID(quoteId) });
    if (!quote) {
      throw new MonkeyError(404, "Quote not found");
    }
    let language = quote.language;
    quote = {
      text: editQuote ? editQuote : quote.text,
      source: editSource ? editSource : quote.source,
      length: quote.text.length,
    };
    let message = "";
    const fileDir = path.join(
      __dirname,
      `../../../monkeytype-new-quotes/static/quotes/${language}.json`
    );
    await git.pull("upstream", "master");
    if (fs.existsSync(fileDir)) {
      let quoteFile = fs.readFileSync(fileDir);
      quoteFile = JSON.parse(quoteFile.toString());
      quoteFile.quotes.every((old) => {
        if (stringSimilarity.compareTwoStrings(old.text, quote.text) > 0.8) {
          throw new MonkeyError(409, "Duplicate quote");
        }
      });
      let newid =
        Math.max.apply(
          Math,
          quoteFile.quotes.map(function (q) {
            return q.id;
          })
        ) + 1;
      quote.id = newid;
      quoteFile.quotes.push(quote);
      message = `Added quote to ${language}.json.`;
    } else {
      //file doesnt exist, create it
      quote.id = 1;
      fs.writeFileSync(
        fileDir,
        JSON.stringify({
          language: language,
          groups: [
            [0, 100],
            [101, 300],
            [301, 600],
            [601, 9999],
          ],
          quotes: [quote],
        })
      );
      message = `Created file ${language}.json and added quote.`;
    }
    await git.add([`static/quotes/${language}.json`]);
    await git.commit(`Added quote to ${language}.json`);
    await git.push("origin", "master");
    await mongoDB().collection("new-quotes").deleteOne({ _id: quoteId });
    return { quote, message };
  }

  static async refuse(quoteId) {
    return await mongoDB().collection("new-quotes").deleteOne({ _id: quoteId });
  }
}

module.exports = NewQuotesDAO;
