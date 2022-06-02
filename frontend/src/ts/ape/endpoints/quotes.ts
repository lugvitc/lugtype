const BASE_PATH = "/quotes";

export default class Quotes {
  constructor(private httpClient: Ape.HttpClient) {
    this.httpClient = httpClient;
  }

  async get(): Ape.EndpointData {
    return await this.httpClient.get(BASE_PATH);
  }

  async submit(
    text: string,
    source: string,
    language: string,
    captcha: string
  ): Ape.EndpointData {
    const payload = {
      text,
      source,
      language,
      captcha,
    };

    return await this.httpClient.post(BASE_PATH, { payload });
  }

  async approveSubmission(
    quoteSubmissionId: string,
    editText?: string,
    editSource?: string
  ): Ape.EndpointData {
    const payload = {
      quoteId: quoteSubmissionId,
      editText,
      editSource,
    };

    return await this.httpClient.post(`${BASE_PATH}/approve`, { payload });
  }

  async rejectSubmission(quoteSubmissionId: string): Ape.EndpointData {
    return await this.httpClient.post(`${BASE_PATH}/reject`, {
      payload: { quoteId: quoteSubmissionId },
    });
  }

  async getRating(quote: MonkeyTypes.Quote): Ape.EndpointData {
    const searchQuery = {
      quoteId: quote.id,
      language: quote.language,
    };

    return await this.httpClient.get(`${BASE_PATH}/rating`, { searchQuery });
  }

  async addRating(quote: MonkeyTypes.Quote, rating: number): Ape.EndpointData {
    const payload = {
      quoteId: quote.id,
      rating,
      language: quote.language,
    };

    return await this.httpClient.post(`${BASE_PATH}/rating`, { payload });
  }

  async report(
    quoteId: string,
    quoteLanguage: string,
    reason: string,
    comment: string,
    captcha: string
  ): Ape.EndpointData {
    const payload = {
      quoteId,
      quoteLanguage,
      reason,
      comment,
      captcha,
    };

    return await this.httpClient.post(`${BASE_PATH}/report`, { payload });
  }
}
