import { expect } from '@playwright/test';
import { BasePage } from './base-page.js';
import { BaseElement } from './base-element.js';

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.cabinet = page.locator('.main:has(.personal__wrapper)');
    this.privateFields = page.locator('.personal__main-private__value, .personal__main-private__email, .personal__main-private__phone, .header-cabinet__link');
    this.trigger = page.locator('a.header-cabinet__link.animate-load:visible').first();
    this.user = new BaseElement(page.locator('input[name=PHONE_LOGIN_EMAIL]:visible'), 'Логин');
    this.pass = new BaseElement(page.locator('input[name=PASSWORD]:visible'), 'Пароль');
    this.submit = page.locator('.bxmaker-authuserphone-enter-auth-by-password-form button:visible');
    this.error = page.locator('.bxmaker-authuserphone-message--error:visible').first();
  }

  async visit(phone = false) {
    await this.open('/catalog/stroitelnye-materialy/');
    expect(new URL(this.page.url()).origin, 'Адрес формы входа').toBe('https://saray.ru');
    await this.trigger.click();
    if (!phone) await this.page.getByText('Войти с помощью пароля', { exact: true }).click();
  }

  async enter(id, password) {
    await this.user.fill(id);
    await this.pass.fill(password);
    await expect(this.pass.locator).toHaveAttribute('type', 'password');
    await this.submit.click();
  }

  async profile(expected) {
    await expect(this.submit).toBeHidden();
    await this.open('/personal/');
    const owner = this.page.locator('.personal__main-private');
    await expect(owner).toBeVisible();
    await expect.poll(async () => (await owner.innerText()).toLowerCase().includes(expected.toLowerCase()), { message: 'Кабинет принадлежит учебной записи' }).toBe(true);
  }

  async registeredPhone() {
    const summary = await this.page.locator('.personal__main-private').innerText();
    const match = summary.match(/(?:\+7|8)[ ()-]*\d(?:[ ()-]*\d){9}/);
    if (!match) throw new Error('В личном кабинете отсутствует привязанный номер телефона.');
    return match[0].replace(/\D/g, '');
  }

  async requestCode(kind) {
    const phone = new BaseElement(this.page.locator('input[name=PHONE]:visible'), 'Телефон');
    if (kind === 'shortPhone') await phone.fill('123');
    await this.page.getByRole('button', { name: 'Далее', exact: true }).click();
  }

  async denied(kind) {
    const phone = /Phone$/.test(kind);
    const message = phone ? /телефон|номер/i : /не указан|не найден|неверн|неправил|некоррект|ошиб|не существует|не задан|не заполн|не авториз/i;
    await expect(this.error).toContainText(message);
    await this.open('/personal/');
    await expect(this.page.locator('.personal__main-private')).toHaveCount(0);
    await expect(this.trigger).toBeVisible();
  }
}
