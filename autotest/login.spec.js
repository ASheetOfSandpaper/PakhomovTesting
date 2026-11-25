import { test, expect } from '../core/fixtures.js';
import { redact } from '../core/redact.js';
import { account, negative, values } from '../core/data.js';
import { LoginPage } from '../ui/login-page.js';

test.beforeEach(() => {
  if (!account.login || !account.password) throw new Error('Для запуска введите данные учебной записи через run.cmd.');
});

test('ТК-А-06.1 · Вход по почте и паролю', async ({ page, journal }) => {
  const login = new LoginPage(page);
  await journal.parameters({ 'Идентификатор': 'Email', 'Пароль': 'Действующий', 'Ожидается': 'Личный кабинет владельца почты' });
  const maskedLogin = redact(account.login);
  const maskedPassword = redact(account.password);
  expect(maskedLogin === '***' && maskedPassword === '***', 'Логин и пароль должны быть полностью скрыты').toBe(true);
  journal.log('INFO', `Логин=${maskedLogin} Пароль=${maskedPassword}`);
  await journal.step('Открыть форму входа по паролю', () => login.visit());
  await journal.step('Ввести учетные данные, проверить маскирование и войти', () => login.enter(account.login, account.password));
  await journal.step('Открыть личный кабинет и сверить почту владельца', () => login.profile(account.login));
  await journal.screenshot('Личный кабинет после входа', login.cabinet, login.privateFields);
});

test('ТК-А-06.2 · Вход по привязанному телефону и паролю', async ({ page, browser, journal }) => {
  await journal.parameters({ 'Идентификатор': 'Привязанный телефон', 'Пароль': 'Действующий', 'Ожидается': 'Кабинет той же записи' });
  const setup = await browser.newPage({ baseURL: new URL('/', process.env.QA_BASE_URL || 'https://saray.ru').href });
  let phone;
  try {
    phone = await journal.step('Прочитать привязанный номер из учебного профиля', async () => {
      const owner = new LoginPage(setup);
      await owner.visit(); await owner.enter(account.login, account.password); await owner.profile(account.login);
      return owner.registeredPhone();
    });
  } finally { await setup.close(); }
  const login = new LoginPage(page);
  await journal.step('Войти по телефону и паролю в независимом сеансе', async () => {
    await login.visit(); await login.enter(phone, account.password);
  });
  await journal.step('Сверить владельца нового сеанса по почте', () => login.profile(account.login));
  await journal.screenshot('Личный кабинет после входа', login.cabinet, login.privateFields);
});
for (const row of negative) {
  test(row.id + ' · ' + row.title, async ({ page, journal }) => {
    const login = new LoginPage(page);
    const phone = /Phone$/.test(row.kind);
    await journal.parameters({ 'Идентификатор': phone ? 'Телефон' : 'Email', 'Класс данных': row.title, 'Ожидается': 'Ошибка, кабинет закрыт' });
    await journal.step('Открыть форму в чистом браузерном контексте', () => login.visit(phone));
    await journal.step('Отправить набор данных выбранного класса', () =>
      phone ? login.requestCode(row.kind) : login.enter(...values(row.kind)));
    await journal.step('Проверить сообщение об ошибке и отсутствие доступа к кабинету', () => login.denied(row.kind));
  });
}
