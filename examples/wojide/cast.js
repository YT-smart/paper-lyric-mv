// 《我记得》角色表：“我”是一个投胎的灵魂，“你”是妈妈——每一世都会以不同身份相遇
const CAST = {
  soul: { kind: 'kid', hairStyle: 'boy', hair: '#3b2c28', coat: '#e7ad55', pants: '#5b4a3e' },           // 小魂（我），黄外套 + 头顶小芽
  mom: { kind: 'adult', hairStyle: 'long', hair: '#2f2422', coat: '#efe2cc', dress: true, scarf: '#d24f45' }, // 今生的你：母亲，红围巾
  girl: { kind: 'kid', hairStyle: 'ponytail', hair: '#33241f', coat: '#d6554a', pants: '#4b3b52', ponySide: 1 }, // 前世一：玩伴
  uncle: { kind: 'adult', hairStyle: 'boy', sprout: false, hair: '#2d2420', coat: '#7d7468', pants: '#3e3a36', hat: 'cap', hatColor: '#4d463f', hatColor2: '#3a342e' }, // 前世二：叔父（我）
  nephew: { kind: 'kid', hairStyle: 'boy', hair: '#2d2420', coat: '#6f8fb8', pants: '#47506a' },         // 前世二：侄儿（你）
  soldier: { kind: 'adult', hairStyle: 'boy', sprout: false, hair: '#2d2420', coat: '#6b7a52', pants: '#56643f', hat: 'army', belt: '#4a3a26' }, // 前世三：上战场的你
  lover: { kind: 'adult', hairStyle: 'bob', hair: '#2a201e', coat: '#5c7fa6', dress: true },             // 前世三：等信的我
  grandma: { kind: 'adult', hairStyle: 'ponytail', hair: '#2f2422', coat: '#f4efe6', pants: '#3d4a66', ponySide: -1 }, // 故去多年的外婆（年轻时）
  doctor: { kind: 'adult', hairStyle: 'none', coat: '#8fc4b8', pants: '#7fb3a8', hat: 'doctor', mask: true, buttons: false },
};
// 轮回之间的“你”的灵魂（小女孩模样，戴着妈妈的红围巾）
const YOUSOUL = { kind: 'kid', hairStyle: 'long', hair: '#2f2422', coat: '#efe2cc', pants: '#8a7a6a', scarf: '#d24f45' };
module.exports = { CAST, YOUSOUL };
