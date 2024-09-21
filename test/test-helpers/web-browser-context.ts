import type { DatabaseFactory as DF } from '../../src'
import type { Page } from 'playwright'

declare let page: Page
declare let DatabaseFactory: typeof DF

export type InWebBrowserContext<R> = (databaseFactory: typeof DF) => Promise<R>

export const performInWebBrowserContext = async <R>(
    inWebBrowser: InWebBrowserContext<R>
): Promise<R> => {
    await page.goto('file://' + __dirname + '/../browser/empty.html')
    return await page.evaluate<R, string>(
        async (inWebBrowserStringified: string): Promise<R> => {
            const inWebBrowser = eval(
                inWebBrowserStringified
            ) as InWebBrowserContext<R>
            return inWebBrowser(DatabaseFactory)
        },
        inWebBrowser.toString()
    )
}
