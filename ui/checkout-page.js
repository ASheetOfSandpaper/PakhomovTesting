import { expect } from '@playwright/test';
import { BasePage } from './base-page.js';
import { BaseElement } from './base-element.js';
import { buyer } from '../core/data.js';
import { money } from './shop-page.js';

export class CheckoutPage extends BasePage {
  async verify(expected) {
    const p = this.page;
    const summary = p.locator('#bx-soa-total:visible').first();
    await expect(summary).toContainText('Самовывоз');
    await expect(summary).toContainText(/Онлайн.оплата/i);
    await p.waitForLoadState('load');
    const customer = p.locator('#soa-property-1');
    if (!await customer.isVisible()) await p.locator('#bx-soa-properties').getByText('Изменить', {exact:true}).click();
    await new BaseElement(customer, 'Ф. И. О.').fill(buyer.name);
    await new BaseElement(p.locator('#soa-property-2'), 'Email покупателя').fill(buyer.email);
    const phone = p.locator('#soa-property-3');
    const digits = buyer.phone.slice(-10);
    await phone.click();
    await phone.press('ControlOrMeta+A');
    await phone.press('Backspace');
    await phone.press('Home');
    await phone.pressSequentially(digits, { delay: 75 });
    await phone.press('Tab');
    expect((await phone.inputValue()).replace(/\D/g,'').slice(-10) === buyer.phone.slice(-10), 'Телефон заполнен по маске').toBe(true);
    await p.locator('#bx-soa-properties').getByText('Продолжить', {exact:true}).click();
    await expect(customer).toBeHidden();
    await expect(p.locator('#bx-soa-properties .has-error:visible')).toHaveCount(0);
    await expect.poll(async () => money(await summary.locator('.bx-soa-cart-total-line-totals .bx-soa-cart-d').innerText())).toBe(expected);
    const terms = summary.locator('.bx-soa-cart-conditions');
    await expect(terms).toContainText(/политик.*конфиденциальности/i);
    await expect(summary.locator('.btn-order-save')).toBeVisible();
    const policy = terms.locator('input#licenses_order');
    await expect(policy).toHaveCount(1);
    if (!await policy.isChecked()) await terms.locator('label[for="licenses_order"] .form-checkbox__box').click();
    await expect(policy).toBeChecked();

    const transfer = terms.getByText('Я согласен(а) с условиями передачи данных третьим лицам', {exact: true});
    await transfer.click();
    const dialog = p.locator('.main-user-consent-request-popup').filter({visible: true});
    await expect(dialog).toContainText(/передачу персональных данных/i);
    await expect(dialog.getByText('Принимаю', {exact: true})).toBeVisible();
    await expect(dialog.getByText('Не принимаю', {exact: true})).toBeVisible();
  }
}
