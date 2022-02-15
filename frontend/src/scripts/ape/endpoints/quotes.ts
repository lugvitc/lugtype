const BASE_PATH = "/quotes";

export default function getQuotesEndpoints(
  apeClient: Ape.Client
): Ape.Endpoints.Quotes {
  async function getQuotes(): Promise<Ape.Response> {
    return await apeClient.get(BASE_PATH);
  }

  async function getQuoteRating(
    quote: MonkeyTypes.Quote
  ): Promise<Ape.Response> {
    const searchQuery = {
      quoteId: quote.id,
      language: quote.language,
    };

    return await apeClient.get(`${BASE_PATH}/rating`, { searchQuery });
  }

  return {
    getQuotes,
    getQuoteRating,
  };
}
