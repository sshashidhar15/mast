const redis = require("redis");
const server = redis.createClient({ host: "localhost", port: 6379, return_buffers: true });
// const server = redis.createClient({ host: "dev-registration-redis.icmarkets.com", port: 6379, return_buffers: true });
// const server = redis.createClient({ host: "staging-registration-redis.icmarkets.com", port: 6379, return_buffers: true });
// const server = redis.createClient({ host: "prod-registration-redis.icmarkets.com", port: 6379, return_buffers: true });

const strings = [
  "legal-documents-view-schema-fsa",
];
const dest_strings = [
  "legal-documents-view-schema-cima",
];

const hashes = [
  "translation-suggestion-fsa",
  "translation-fsa",
  "faq-sections-fsa",
];
const dest_hashes = [
  "translation-suggestion-cima",
  "translation-cima",
  "faq-sections-cima",
];

const lists = [
  "history-fsa",
  "futures-index-fsa",
  "futures-bonds-fsa",
  "futures-commodity-fsa",
];
const dest_lists = [
  "history-cima",
  "futures-index-cima",
  "futures-bonds-cima",
  "futures-commodity-cima",
];

server.on("connect", () => {
  strings.forEach((key, index) => {
    server.get(key, (err, val) => {
        server.set(dest_strings[index], val, (e, reply) => {
        console.log(e);
        console.log(reply);
      });
    });
  });

  hashes.forEach((key, index) => {
    server.hgetall(key, (err, val) => {
      server.hmset(dest_hashes[index], val, (e, reply) => {
        console.log(e);
        console.log(reply);
      });
    });
  });

  lists.forEach((key, index) => {
    server.lrange(key, 0, -1, (err, val) => {
      server.lpush(dest_lists[index], val.reverse(), (e, reply) => {
        console.log(e);
        console.log(reply);
      });
    });
  });
});
