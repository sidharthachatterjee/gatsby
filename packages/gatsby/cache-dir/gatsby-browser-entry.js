/* eslint-disable no-debugger */
import React from "react"
import PropTypes from "prop-types"
import Link, {
  withPrefix,
  withAssetPrefix,
  navigate,
  push,
  replace,
  navigateTo,
  parsePath,
} from "gatsby-link"
import PageRenderer from "./public-page-renderer"
import loader from "./loader"
import { requestData } from "./socketIo"
import md5 from "md5"
const pDefer = require(`p-defer`)

// const { processQueryOnDemand } = require(`../src/query`)

const prefetchPathname = loader.enqueue

const StaticQueryContext = React.createContext({})

function StaticQueryDataRenderer({ staticQueryData, data, query, render }) {
  const finalData = data
    ? data.data
    : staticQueryData[query] && staticQueryData[query].data

  return (
    <React.Fragment>
      {finalData && render(finalData)}
      {!finalData && <div>Loading (StaticQuery)</div>}
    </React.Fragment>
  )
}

const StaticQuery = props => {
  const { data, query, render, children } = props

  return (
    <StaticQueryContext.Consumer>
      {staticQueryData => (
        <StaticQueryDataRenderer
          data={data}
          query={query}
          render={render || children}
          staticQueryData={staticQueryData}
        />
      )}
    </StaticQueryContext.Consumer>
  )
}

const useStaticQuery = query => {
  if (
    typeof React.useContext !== `function` &&
    process.env.NODE_ENV === `development`
  ) {
    throw new Error(
      `You're likely using a version of React that doesn't support Hooks\n` +
        `Please update React and ReactDOM to 16.8.0 or later to use the useStaticQuery hook.`
    )
  }
  const context = React.useContext(StaticQueryContext)
  if (context[query] && context[query].data) {
    return context[query].data
  } else {
    throw new Error(
      `The result of this StaticQuery could not be fetched.\n\n` +
        `This is likely a bug in Gatsby and if refreshing the page does not fix it, ` +
        `please open an issue in https://github.com/gatsbyjs/gatsby/issues`
    )
  }
}

StaticQuery.propTypes = {
  data: PropTypes.object,
  query: PropTypes.string.isRequired,
  render: PropTypes.func,
  children: PropTypes.func,
}

function graphql(query) {
  // throw new Error(
  //   `It appears like Gatsby is misconfigured. Gatsby related \`graphql\` calls ` +
  //     `are supposed to only be evaluated at compile time, and then compiled away. ` +
  //     `Unfortunately, something went wrong and the query was left in the compiled code.\n\n` +
  //     `Unless your site has a complex or custom babel/Gatsby configuration this is likely a bug in Gatsby.`
  // )
  console.log(`query`, query)
  return query
}

class QueryResponseStore {
  constructor() {
    this.queryResultMap = new Map()
  }
  fetch(query, variables, hash) {
    requestData(query, variables, hash)
    return pDefer()
  }
  read(query, variables) {
    const hash = md5([query, variables])
    const queryResult = this.queryResultMap.get(hash)
    if (queryResult) {
      if (queryResult.promise instanceof Promise) {
        throw queryResult.promise
      } else {
        return queryResult
      }
    } else {
      const queryResultPromise = this.fetch(query, variables, hash)
      this.queryResultMap.set(hash, queryResultPromise)
      throw queryResultPromise.promise
    }
  }
}

const queryResponseStore = new QueryResponseStore()

const useQuery = (query, variables) => {
  const result = queryResponseStore.read(query, variables)
  return result
}

export {
  Link,
  withAssetPrefix,
  withPrefix,
  graphql,
  parsePath,
  navigate,
  push, // TODO replace for v3
  replace, // TODO remove replace for v3
  navigateTo, // TODO: remove navigateTo for v3
  StaticQueryContext,
  StaticQuery,
  PageRenderer,
  useStaticQuery,
  prefetchPathname,
  useQuery,
  queryResponseStore,
}
