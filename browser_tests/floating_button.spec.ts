import { expect, test } from '@playwright/test'
import { startComfy, killComfy } from './comfyProc'
import * as fs from 'fs'

const apiKeyPath = '../../api_key.ini'

test.describe.configure({ mode: 'serial' })

test.describe('Floating Button', () => {
  // TODO: if tests' behavior can be unified, should turn setup & teardown into fixture
  test.beforeAll(async () => {
    // Delete api_key.ini
    if (fs.existsSync(apiKeyPath)) {
      fs.unlink(apiKeyPath, err => {
        if (err) throw err
        console.log('api_key.ini deleted')
      })
    }
    await startComfy()
  })

  test.afterAll(async () => {
    if (!fs.existsSync(apiKeyPath)) {
      console.error("api_key.ini doesn't exsit")
      throw Error("api_key.ini doesn't exsit")
    }
    await killComfy()
  })

  // Navigate to comfy and open the empty workflow
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8188/')
    await page.locator('.workflows-tab-button').click()
    await page
      .locator('.comfyui-workflows-browse .node-label', {
        hasText: 'EmptyWorkflow.json'
      })
      .click()
    await page.waitForTimeout(500)
  })

  // #1 Without api key
  test('no api key', async ({ page }, testInfo) => {
    await expect(page).toHaveScreenshot(`floating_button_${testInfo.title}.png`)
  })

  // #2 Try setting an invalid api key before profile is set
  test('set invalid api key before', async ({ page }, testInfo) => {
    await page.getByText('API Key', { exact: true }).locator('..').click()
    await page.getByPlaceholder('API Key').fill('a')
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: 'Close' }).nth(1).click()
    await expect(page).toHaveScreenshot(`floating_button_${testInfo.title}.png`)
  })

  // #3 Set a valid api key
  test('set valid api key', async ({ page }, testInfo) => {
    await page.getByText('API Key', { exact: true }).locator('..').click()
    await page.getByPlaceholder('API Key').fill(process.env.BIZYAIR_KEY)
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.waitForTimeout(500)
    await expect(page).toHaveScreenshot(`floating_button_${testInfo.title}.png`)
  })

  // #4 Try setting an invalid api key after profile is set
  test('set invalid api key after', async ({ page }, testInfo) => {
    await page.getByText('Profile', { exact: true }).locator('..').click()
    await page
      .locator('//span[@id="bizyair-profile-password"]/following-sibling::*[1]/child::*[1]')
      .click()
    await page.getByPlaceholder('API Key').fill('a')
    await page.getByRole('button', { name: 'Submit' }).click()
    await page.waitForTimeout(500)
    await page.getByRole('button', { name: 'Close' }).nth(1).click()
    await page.locator('.lucide').first().click()
    await expect(page).toHaveScreenshot(`floating_button_${testInfo.title}.png`)
  })

  // TODO: move floating button
  // TODO: test publish model & workflow
  // TODO: test examples
  /*test("set invalid api key", async ({ page }) => {

  })*/
})