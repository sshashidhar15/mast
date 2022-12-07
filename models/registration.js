const fetch = require('node-fetch')
,     {branch_wcf_ids, reg_service_endpoint, default_regulator} = require('../config')
,     reverseObject = require('../utils/reverseObject')

class API {
  constructor() {
    this.data = null
    this.timeout = null
    this.init()
  }

  init(clear) {
    return !clear && this.data
      ? Promise.resolve(this.data)
      : fetch(`${reg_service_endpoint}?getData&request_from=WEBSITE_BACKEND&sign=1`)
        .catch((res) => {
            if (res) console.error('ERROR: unexpected response from RegService', JSON.stringify(res))
            if (this.timeout) clearTimeout(this.timeout)
            this.timeout = setTimeout(() => this.init(true), 5 * 60 * 1000)
        })
        .then(res => {
          if (this.timeout) clearTimeout(this.timeout)
          this.timeout = setTimeout(() => this.init(true), 5 * 60 * 1000) // 5 minutes
          return (res && res.ok) ? res.json() : Promise.reject(res)
        })
        .then(data => {
          this.data = data
        })
  }

  async isDefaultRegulator(country, regulator) {
    let branchID = branch_wcf_ids[regulator]
    ,   branching = await this.getBranchData(country)
    ,   branchData = branching && branching.find(b => b.branch === branchID)
    return branchData && branchData.default

  }

  async getDefaultRegulator(country) {
    let branching = await this.getBranchData(country)
    ,   branchData = branching && branching.find(b => b.default)
    return branchData && branchData.branch
        ? reverseObject(branch_wcf_ids)[branchData.branch]
        : default_regulator
  }

  getCysecCountriesList(/*country*/) {
    return this.init()
      .then(data => data.countries)
      .then(countries =>
        countries.filter(c =>
          c.branching && (c.branching.find(b => b.branch === '2' && b.status == 1)/* || (c.code.toLowerCase() === country && ['au', 'bs'].includes(country))*/)
        ).map(country => country.code.toLowerCase())
      )
  }

  getBranchData(country) {
    return this.init()
      .then(() => {
        let { countries } = this.data
        ,   countryData = countries.find(c => c.code.toLowerCase() === country)
        return countryData && countryData.branching
      })
  }

    getAllCountries() {
        return this.init()
            .then(() => {
                let { countries } = this.data
                return countries
            })
    }

    update_countries(countries) {
      console.info('update_countries by channel countries with countries: ' + JSON.stringify(countries))
      this.data.countries = countries
  }

  destroy() {
      if (this.timeout) clearTimeout(this.timeout)
  }
}

module.exports = new API()
