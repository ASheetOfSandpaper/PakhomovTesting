import { expect } from '@playwright/test';
import { BasePage } from './base-page.js';
import { BaseElement } from './base-element.js';
import { product } from '../core/data.js';

export function money(text) {
  const match = text.replace(/[\s\u00a0\u202f]/g, '').match(/\d+(?:[.,]\d{1,2})?/);
  if (!match) throw new Error('На странице не найдена цена.');
  return Math.round(Number(match[0].replace(',', '.')) * 100);
}

export class ShopPage extends BasePage {
  constructor(page) {
    super(page);
    this.add = page.locator('.catalog-detail__cart button.to_cart:visible').first();
  }

  async search() {
    await this.open('/catalog/stroitelnye-materialy/');
    const field = this.page.locator('input[name=q]:visible').first();
    await new BaseElement(field, 'Запрос').fill(product.query);
    await field.press('Enter');
    const link = this.page.locator('a.js-popup-title:visible').filter({ hasText: product.name }).first();
    await expect(link).toBeVisible();
    const target = new URL(await link.getAttribute('href'), this.page.url());
    expect(target.origin).toBe(new URL(this.page.url()).origin);
    await this.open(target.href);
    await expect(this.page.locator('h1:visible').first()).toHaveText(product.name);
  }

  async prices() {
    await expect(this.page.locator('.catalog-detail__buy-block .instock').first()).toContainText(/В наличии:\s*[1-9]/);
    const price = money(await this.page.locator('.catalog-detail__price .price__new-val:visible').first().innerText());
    expect(price).toBeGreaterThan(0);
    return { retail: price, card: price };
  }

  async addToBasket() {

    await this.add.click();
  }
}
