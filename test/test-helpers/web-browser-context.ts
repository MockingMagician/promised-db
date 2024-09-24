import type { DatabaseFactory as DF } from '../../src'
import { Page } from '@playwright/test'

declare let DatabaseFactory: typeof DF

export type InWebBrowserContext<R> = (databaseFactory: typeof DF) => Promise<R>

export const performInWebBrowserContext = async <R>(
    page: Page,
    inWebBrowser: InWebBrowserContext<R>
): Promise<R> => {
    await page.goto('/')
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
