import { test, expect } from "@playwright/test";
import { selectProducts, acceptCookiePolicy, login } from "../helpers/commands";
import { customerInfoResponse, previewResponse } from "../helpers/mockData";
import { ENDPOINTS } from "../helpers/utils";

test.describe("Checkout - Region and taxes", () => {
  test("It should show correct non-VAT price", async ({page}) => {
    await page.goto("/pro/subscribe")
    await acceptCookiePolicy(page)
    await selectProducts(page);
    await page.getByRole("button", { name: "Buy now" }).click();

    await login(page);
    
    await page.route(ENDPOINTS.customerInfo,  async (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({...customerInfoResponse, "customerInfo": {...customerInfoResponse.customerInfo, "address": {...customerInfoResponse.customerInfo.address, "country": "AF" }}})
      });
    });

    await page.route(ENDPOINTS.preview,  async (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(previewResponse)
      });
    });
   
    await page.locator(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click(); // Click "Edit" button
    await page.getByLabel("Country/Region:").selectOption({ label: 'Afghanistan' })
    await page.locator(".u-align--right > :nth-child(2)").click(); // Click "Save" button

    const country = await page.$('[data-testid="country"]')
    const countryText = await country?.innerText();

    expect(countryText).toBe("Afghanistan")
    expect(await page.$('[data-testid="total"]')).toBeNull();
    expect(await page.$('[data-testid="tax"]')).toBeNull();
  })

  test("Click cancel should reset fields", async ({page}) => {
    await page.goto("/pro/subscribe")
    await acceptCookiePolicy(page)
    await selectProducts(page);
    await page.getByRole("button", { name: "Buy now" }).click();

    await login(page);

    await page.locator(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click(); // Click "Edit" button
    await page.getByLabel("Country/Region:").selectOption({ label: 'France' })
    await page.getByLabel("VAT number:").fill("ABDCDEFG")

    // Click cancel button
    await page.locator( ":nth-child(1) > .p-stepped-list__content > :nth-child(1) > .u-align--right > :nth-child(1)").click();
    
    const country = await page.$('[data-testid="country"]')
    const countryText = await country?.innerText();
    const vatNumber = await page.$('[data-testid="vat-number"]')
    const vatNumberText =  await vatNumber?.innerText();

    expect(countryText).toBe("United Kingdom");
    expect(vatNumberText).toBe("None");

    // Click 1st Edit button
    await page.locator(
      ":nth-child(1) > .p-stepped-list__content > .row > .u-align--right > .p-action-button"
    ).click(); // Click "Edit" button
    await page.getByLabel("Country/Region:").selectOption({ label: 'Canada' })
    await page.getByLabel("Province:").selectOption({ label: 'Alberta' })

     // Click cancel button
    await page.locator( ":nth-child(1) > .p-stepped-list__content > :nth-child(1) > .u-align--right > :nth-child(1)").click();
    
    expect(countryText).toBe("United Kingdom");
    expect(vatNumberText).toBe("None");
  })
})

test.describe("Checkout - Your inforamtion", ()=>{
  test("Click cancel should reset field", async ({page}) => {
    await page.goto("/pro/subscribe")
    await acceptCookiePolicy(page)
    await selectProducts(page);
    await page.getByRole("button", { name: "Buy now" }).click();

    await login(page);
    
    await expect(page).toHaveURL('/account/checkout');

    await page.locator( ":nth-child(3) > .p-stepped-list__content > :nth-child(1) > .u-align--right > .p-action-button").click(); // Click Edit button

    await page.getByLabel("Name:").fill("Abcd")
    await page.getByLabel("Address:").fill("Abcd");
    await page.getByLabel("City:").fill("Abcd");
    await page.getByLabel("Postal code:").fill("Abcd");
    await page.locator( ":nth-child(3) > .p-stepped-list__content > :nth-child(1) > .u-align--right > :nth-child(1)").click(); // Click cancel button

    const customerName = await page.locator("data-testid=customer-name").innerText();
    const customerAddress = await page.locator("data-testid=customer-address").innerText();
    const customerCity = await page.locator("data-testid=customer-city").innerText();;
    const customerPostalCode = await page.locator("data-testid=customer-postal-code").innerText();;
    expect(customerName).not.toContain("Abcd");
    expect(customerAddress).not.toContain("Abcd");
    expect(customerCity).not.toContain("Abcd");
    expect(customerPostalCode).not.toContain("Abcd");
  })
})