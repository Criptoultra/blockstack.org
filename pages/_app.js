import App, { Container } from 'next/app'
import React, { useRef } from 'react'
import useComponentSize from '@rehooks/component-size'

import Header from '@components/header'
import { Footer } from '@components/footer'
import { Box } from 'blockstack-ui'
import NoTemplate from '@components/templates/none'
import Head from 'next/head'
import { Mdx } from '@components/mdx'
import withReduxStore from '@common/withReduxStore'
import { createGlobalStyle, ThemeProvider, css } from 'styled-components'

import { Provider as ReduxProvider } from 'redux-bundler-react'
import { normalize } from 'polished'
import { theme } from '@common/theme'

export const HeaderHeightContext = React.createContext(null)

const fetchOurData = async (ctx) => {
  if (!ctx.reduxStore.selectJobs()) {
    await ctx.reduxStore.doFetchJobsData()
  }
}

const WrappedComponent = ({
  pageComponent: PageComponent,
  pageProps,
  ...rest
}) => {
  const ref = useRef(null)
  const size = useComponentSize(ref)
  const height = size && size.height

  return (
    <HeaderHeightContext.Provider value={height}>
      <Box position="relative" {...rest}>
        <Header innerRef={ref} />
        <PageComponent headerHeight={height} {...pageProps} />
        <Footer />
      </Box>
    </HeaderHeightContext.Provider>
  )
}

const styles = css`
  ${normalize};
  html,
  body {
    font-family: ${theme.fonts.default};
    font-size: 16px;
    line-height: 1.25rem;
  }
  * {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    box-sizing: border-box;
  }
`

const GlobalStyles = createGlobalStyle`
${styles}
`

class MyApp extends App {
  static async getInitialProps({ Component, router, ctx }) {
    let pageProps = {}

    await fetchOurData(ctx)

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps, store: ctx.reduxStore }
  }

  componentWillMount() {
    if (!this.props.store.selectIsDebug()) {
      this.props.store.doEnableDebug()
    }
  }

  componentDidMount() {}

  render() {
    const { Component, pageProps } = this.props

    const title =
      pageProps && pageProps.meta && pageProps.meta.title !== 'Blockstack'
        ? `${pageProps.meta.title} — Blockstack`
        : 'Blockstack'

    const PageComponent = (props) => (
      <NoTemplate
        component={Component}
        meta={pageProps.meta}
        {...props}
        {...pageProps}
      />
    )

    return (
      <ReduxProvider store={this.props.store}>
        <Mdx>
          <Container>
            <Head>
              <script src="https://cdn.polyfill.io/v2/polyfill.min.js" />
              <title>{title}</title>
              <meta name="theme-color" content="#3700ff" />
              <meta charSet="UTF-8" />
              <meta
                name="viewport"
                content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
              />
            </Head>
            <GlobalStyles />
            <ThemeProvider theme={theme}>
              <WrappedComponent
                pageComponent={PageComponent}
                pageProps={pageProps}
              />
            </ThemeProvider>
          </Container>
        </Mdx>
      </ReduxProvider>
    )
  }
}

export default withReduxStore(MyApp)
