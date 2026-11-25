import { randomUUID } from 'node:crypto';

export const account = { login: process.env.SARAY_LOGIN || '', password: process.env.SARAY_PASSWORD || '' };
export const buyer = { name: 'Иван Тестовый', email: 'student@example.test', phone: '79000000003' };
export const product = {
  query: 'гипсокартон',
  name: 'ГКЛ 12,5 мм Vetonit Оптима 1200х2500 мм',
  quantity: 1
};

export const negative = [
  { id: 'ТК-А-08.1', title: 'Пустой идентификатор', kind: 'emptyLogin' },
  { id: 'ТК-А-08.2', title: 'Пустой пароль', kind: 'emptyPassword' },
  { id: 'ТК-А-07.1', title: 'Неверный пароль', kind: 'wrongPassword' },
  { id: 'ТК-А-07.2', title: 'Незарегистрированная почта', kind: 'absent' },
  { id: 'ТК-А-07.3', title: 'Email без домена', kind: 'format' },
  { id: 'ТК-А-02', title: 'Запрос кода без телефона', kind: 'emptyPhone' },
  { id: 'ТК-А-03', title: 'Неполный номер телефона', kind: 'shortPhone' }
];

export function values(kind) {
  const id = { emptyLogin: '', absent: 'qa-' + randomUUID() + '@example.invalid', format: 'student@' };
  const pw = { emptyPassword: '', wrongPassword: 'Invalid-' + randomUUID() };
  return [id[kind] ?? account.login, pw[kind] ?? account.password];
}
