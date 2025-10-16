// Каталог можно подтягивать с сервера; для наглядности берём статичный список.
// Цены — в минимальных единицах (копейки/центы), как и в вашем боте.
const CATALOG = [
  {
    id: "socks_classic_white",
    title: "Носки Classic White",
    description: "Хлопок 80%, лайкра 20%",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Socks_white.png/320px-Socks_white.png",
    price: 990,
    sizes: ["38-40","41-43","44-46"]
  },
  {
    id: "socks_sport_black",
    title: "Носки Sport Black",
    description: "Дышащая вставка, усиленный мысок",
    photo: "https://pizhon.by/assets/images/products/8497/prod/noski-chernyie.webp",
    price: 1290,
    sizes: ["38-40","41-43","44-46"]
  },
  {
    id: "socks_funny_dots",
    title: "Носки Funny Dots",
    description: "Яркий принт, подарочная упаковка",
    photo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Socks_colored.png/320px-Socks_colored.png",
    price: 1490,
    sizes: ["36-38","39-41","42-44"]
  }
];

const tg = window.Telegram.WebApp;
tg.expand();

const fmt = v => (v/100).toFixed(2);

const cart = []; // {id,title,price,size,qty,photo}

function renderCatalog() {
  const root = document.getElementById('catalog');
  root.innerHTML = '';
  CATALOG.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'card';

    const img = document.createElement('img');
    img.src = prod.photo;
    img.alt = prod.title;

    const right = document.createElement('div');

    const h3 = document.createElement('h3'); h3.textContent = prod.title;
    const p  = document.createElement('p');  p.textContent = prod.description + ` • ${fmt(prod.price)} BYN`;

    // sizes
    const sizesRow = document.createElement('div');
    sizesRow.className = 'row';
    let selectedSize = null;
    prod.sizes.forEach(s => {
      const b = document.createElement('button');
      b.className = 'size';
      b.textContent = s;
      b.onclick = () => {
        selectedSize = s;
        [...sizesRow.children].forEach(c => c.classList.remove('active'));
        b.classList.add('active');
        addBtn.disabled = false;
      };
      sizesRow.appendChild(b);
    });

    // qty
    const qtyRow = document.createElement('div');
    qtyRow.className = 'row qty';
    let qty = 1;
    const minus = document.createElement('button'); minus.textContent = '−';
    const plus  = document.createElement('button'); plus.textContent  = '+';
    const qv    = document.createElement('span');   qv.textContent = String(qty);
    minus.onclick = () => { qty = Math.max(1, qty-1); qv.textContent = String(qty); };
    plus.onclick  = () => { qty += 1; qv.textContent = String(qty); };
    qtyRow.append('Кол-во:', minus, qv, plus);

    const addBtn = document.createElement('button');
    addBtn.className = 'add';
    addBtn.textContent = 'Добавить';
    addBtn.disabled = true;
    addBtn.onclick = () => {
      if (!selectedSize) return;
      cart.push({
        id: prod.id,
        title: prod.title,
        price: prod.price,
        size: selectedSize,
        qty,
        photo: prod.photo
      });
      renderCart();
      tg.HapticFeedback.impactOccurred("soft");
    };

    right.append(h3, p, sizesRow, qtyRow, addBtn);

    card.append(img, right);
    root.appendChild(card);
  });
}

function renderCart() {
  const list = document.getElementById('cart-items');
  list.innerHTML = '';

  let total = 0;
  cart.forEach((item, idx) => {
    const line = document.createElement('div');
    line.className = 'line';
    const left = document.createElement('div');
    left.textContent = `${item.title} (${item.size}) x${item.qty}`;
    const right = document.createElement('div');
    right.textContent = `${fmt(item.price*item.qty)} BYN`;
    line.append(left, right);
    list.appendChild(line);
    total += item.price*item.qty;
  });

  document.getElementById('total-price').textContent = fmt(total);
  document.getElementById('checkout').disabled = cart.length === 0;
}

document.getElementById('checkout').onclick = () => {
  const total = cart.reduce((s,i)=>s+i.price*i.qty, 0);
  const payload = { cart, total };
  // отправляем данные в чат боту
  tg.sendData(JSON.stringify(payload));
  tg.close();
};

renderCatalog();
renderCart();
