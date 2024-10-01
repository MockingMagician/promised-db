import { Page } from '@playwright/test'
import type { Unboxed } from 'playwright-core/types/structs'

export type ToExecuteInBrowser<Args, R> = (arg: Unboxed<Args>) => Promise<R>

export const executeInBrowser = async <R, Args>(
    page: Page,
    func: ToExecuteInBrowser<Args, R>,
    args: Args = undefined
): Promise<R> => {
    await page.goto('/')
    return await page.evaluate<R, Args>(func, args)
}
