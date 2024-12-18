import { expect, test } from '@playwright/test'
//import * as fs from "fs"

test('floating_button', async ({ page }) => {
  await page.goto('http://localhost:8188/')
  // With valid api key
  await page.locator('.workflows-tab-button').click()
  await page
    .locator('.comfyui-workflows-browse .node-label', {
      hasText: 'EmptyWorkflow.json'
    })
    .click()
  await page.waitForTimeout(500)
  await expect(page).toHaveScreenshot('floating_button_1.png', {
    maxDiffPixelRatio: 0.01
  })

  // Unset api key
  const setBtn = await page.locator(
    '//span[@id="bizyair-profile-password"]/following-sibling/*[1]'
  )
  await page.getByText('Profile').locator('..').click()
  await setBtn.click()
  await page.getByPlaceholder('API Key').fill('a')
  await page.getByRole('button', { name: 'Submit' }).click()

  await page.getByPlaceholder('API Key').click()
  await page.getByPlaceholder('API Key').fill(process.env.BIZYAIR_KEY)
  // TODO: close and screenshot
  await page.getByRole('button', { name: 'Submit' }).click()
  await page.getByRole('button', { name: 'Close' }).nth(1).click()
  await page.locator('.lucide').first().click()

  await expect(page).toHaveScreenshot('floating_button_1.png', {
    maxDiffPixelRatio: 0.01
  })
  // END CAP

  await page.getByRole('button', { name: 'Submit' }).click()
  await page.locator('.lucide').first().click()
  await page.getByText('Profile').click()
  await page.locator('.lucide').first().click()

  // Set api key
  await page.getByText('API Key').click()
  setBtn.click()
  await page.getByPlaceholder('API Key').fill(process.env.BIZYAIR_KEY)
  await page.getByRole('button', { name: 'Submit' }).click()
  await expect(page).toHaveScreenshot('floating_button_2.png', {
    maxDiffPixelRatio: 0.01
  })
  // TODO: move floating button
  // TODO: test publish model & workflow
  // TODO: test examples
})
