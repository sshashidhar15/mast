const redis = require("redis");

const source = redis.createClient({ host: "dev-registration-redis.icmarkets.com", port: 6379, return_buffers: true });
const dest = redis.createClient({ return_buffers: true });

const strings = [
  "cmc-cache",
  "legal-documents-view-schema-asic",
  "legal-documents-view-schema-cysec",
  "legal-documents-view-schema-fsa",
  "legal-documents-view-schema-scb",
  "legal-documents-view-schema-fca",
  "LEGAL_DOCUMENTS_VIEW_SCHEMA",
  "CHANNELS",
];
const hashes = [
  "translation-suggestion-asic",
  "translation-suggestion-cysec",
  "translation-suggestion-fsa",
  "translation-suggestion-scb",
  "translation-suggestion-fca",
  "translation-asic",
  "translation-cysec",
  "translation-fsa",
  "translation-scb",
  "translation-fca",
  "faq-sections-asic",
  "faq-sections-cysec",
  "faq-sections-fsa",
  "faq-sections-scb",
  "faq-sections-fca",
  "FUTURES_COMMODITY",
  "FUTURES_INDEX",
  "FUTURES_BONDS",
  "careers",
  "cmc-settings",
  "migrations",
  "restrict_settings",
  "restrict_whitelist",
];
const lists = [
  "history-asic",
  "history-cysec",
  "history-fsa",
  "history-scb",
  "history-fca",
  "futures-index-asic",
  "futures-index-cysec",
  "futures-index-fsa",
  "futures-index-scb",
  "futures-index-fca",
  "futures-bonds-asic",
  "futures-bonds-cysec",
  "futures-bonds-fsa",
  "futures-bonds-scb",
  "futures-bonds-fca",
  "futures-commodity-asic",
  "futures-commodity-cysec",
  "futures-commodity-fsa",
  "futures-commodity-scb",
  "futures-commodity-fca",
  "LEGAL_DOCUMENTS_LINKS",
];

dest.on("connect", () => {
  strings.forEach((key) => {
    source.get(key, (err, val) => {
      dest.set(key, val, (e, reply) => {
        console.log(e);
        console.log(reply);
      });
    });
  });

  hashes.forEach((key) => {
    source.hgetall(key, (err, val) => {
      dest.hmset(key, val, (e, reply) => {
        console.log(e);
        console.log(reply);
      });
    });
  });

  lists.forEach((key) => {
    source.lrange(key, 0, -1, (err, val) => {
      dest.lpush(key, val, (e, reply) => {
        console.log(e);
        console.log(reply);
      });
    });
  });
});
