var model = require('../models/legal_documents_links')

var links = [
  "http://cdn.icmarkets.eu/BEST+INTEREST+OF+THE+CLIENT+AND+ORDER+EXECUTION+POLICY.pdf",
  "https://cdn.icmarkets.eu/COSTS+%26+CHARGES.pdf",
  "https://cdn.icmarkets.eu/CLIENT+CATEGORIZATION+POLICY.pdf",
  "http://cdn.icmarkets.eu/COMPANY+INFORMATION.pdf",
  "https://cdn.icmarkets.eu/COMPLAINT+HANDLING+POLICY.pdf",
  "https://cdn.icmarkets.eu/CONFLICT+OF+INTEREST.pdf",
  "https://cdn.icmarkets.eu/COOKIES+POLICY.pdf",
  "https://cdn.icmarkets.eu/DEPOSITS+AND+WITHDRAWALS+POLICY.pdf",
  "http://cdn.icmarkets.eu/Disclosure+of+Information+(Pillar+3)+for+year+ending+Dec+2018+Audited.pdf",
  "https://cdn.icmarkets.eu/INVESTOR+COMPENSATION+FUND+PROTECTION+SCHEME.pdf",
  "http://cdn.icmarkets.eu/KID_ON_BONDS.pdf",
  "http://cdn.icmarkets.eu/KID_ON_ENERGIES.pdf",
  "http://cdn.icmarkets.eu/KID_ON_FUTURES.pdf",
  "http://cdn.icmarkets.eu/KID_ON_FX_MAJOR+PAIRS.pdf",
  "http://cdn.icmarkets.eu/KID_ON_FX_MINOR+PAIRS.pdf",
  "http://cdn.icmarkets.eu/KID_ON_FX_EXOTIC+PAIRS.pdf",
  "https://cdn.icmarkets.eu/KIID_ON_FX.pdf",
  "http://cdn.icmarkets.eu/KID_ON_INDICES.pdf",
  "http://cdn.icmarkets.eu/KID_ON_METALS.pdf",
  "https://cdn.icmarkets.eu/KID_ON_CRYPTOS.pdf",
  "https://cdn.icmarkets.eu/KIID_ON_COMMODITIES.pdf",
  "http://cdn.icmarkets.eu/KID_ON_STOCKS.pdf",
  "https://cdn.icmarkets.eu/POLITICALLY+EXPOSED+PERSON+(PEP)+DEFINITION.pdf",
  "https://cdn.icmarkets.eu/POLITICALLY+EXPOSED+PERSON+(PEP)+FORM.pdf",
  "https://cdn.icmarkets.eu/REFUND+AND+CANCELLATION+POLICY.pdf",
  "https://cdn.icmarkets.eu/RISK+DISCLOSURE+NOTICE.pdf",
  "https://cdn.icmarkets.eu/TERMS+AND+CONDITIONS+OF+BUSINESS.pdf",
  "http://cdn.icmarkets.eu/PRIVACY+POLICY.pdf"
]


module.exports.up = next =>
  console.info('Migration legal-documents-links up') || Promise.all(
    links.map(link =>
      new Promise((y, n) =>
        model.create(link, e =>
          e
            ? n(e)
            : y())))
  )
    .then(() => console.info('Migration legal-documents-links up done') || next())
    .catch(e => console.error('Migration legal-documents-links up fail:', e) || process.exit(1))


module.exports.down = next =>
  console.info('Migration legal-documents-links down') || Promise.all(
    links.map(link =>
      new Promise((y, n) =>
        model.delete(link, e =>
          e
            ? n(e)
            : y())))
  )
    .then(() => console.info('Migration legal-documents-links down done') || next())
    .catch(e => console.error('Migration legal-documents-links down fail:', e) || process.exit(1))
