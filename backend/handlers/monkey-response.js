class MonkeyResponse {
  constructor(message, data, status = 200) {
    this.message = message;
    this.data = data ?? null;
    this.status = status;
  }
}

function handleMonkeyResponse(handlerData, res) {
  const isMonkeyResponse = handlerData instanceof MonkeyResponse;
  const monkeyResponse = !isMonkeyResponse
    ? new MonkeyResponse("Ok", handlerData)
    : handlerData;
  const { message, data, status } = monkeyResponse;

  res.status(status);

  if ([301, 302].includes(status)) {
    return res.redirect(data);
  }

  res.json({ message, data });
}

module.exports = {
  MonkeyResponse,
  handleMonkeyResponse,
};
