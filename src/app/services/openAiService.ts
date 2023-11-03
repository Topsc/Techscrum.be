const { Configuration, OpenAIApi } = require('openai');
const openAiConfig = require('../config/openAi');
const configuration = new Configuration({
  apiKey: openAiConfig.openAiKey,
});
const openai = new OpenAIApi(configuration);

module.exports = openai;
