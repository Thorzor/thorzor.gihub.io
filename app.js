// Инициализация Telegram WebApp
const tgWebApp = window.Telegram.WebApp;

// Настройка темы и поведения
tgWebApp.ready();
tgWebApp.expand();

// Установка цвета заголовка под тему Telegram
tgWebApp.setHeaderColor('#ffffff');
tgWebApp.setBackgroundColor('#f5f5f5');

// Данные о пиццах
const pizzas = [
    {
        id: 1,
        name: "Маргарита",
        price: 499, // в копейках/центах
        currency: "RUB",
        image: "https://media.istockphoto.com/id/1168754685/ru/%D1%84%D0%BE%D1%82%D0%BE/%D0%BF%D0%B8%D1%86%D1%86%D0%B0-%D0%BC%D0%B0%D1%80%D0%B3%D0%B0%D1%80%D0%B8%D1%82%D0%B0-%D1%81-%D1%81%D1%8B%D1%80%D0%BE%D0%BC-%D0%B2%D0%B8%D0%B4-%D1%81%D0%B2%D0%B5%D1%80%D1%85%D1%83-%D0%B8%D0%B7%D0%BE%D0%BB%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D1%8B-%D0%BD%D0%B0-%D0%B1%D0%B5%D0%BB%D0%BE%D0%BC-%D1%84%D0%BE%D0%BD%D0%B5.jpg?s=612x612&w=0&k=20&c=2DI8tUW4BmtQKGNl81LzgfxUoXcsmsgk5I5jd1UypI8=",
        description: "Классика: томаты, моцарелла, базилик"
    },
    {
        id: 2,
        name: "Пепперони",
        price: 599,
        currency: "RUB",
        image: "https://www.shutterstock.com/image-photo/small-size-pizza-pepperoni-on-260nw-2039301926.jpg",
        description: "Острая пепперони с сыром и томатным соусом"
    },
    {
        id: 3,
        name: "Гавайская",
        price: 549,
        currency: "RUB",
        image: "https://www.shutterstock.com/image-photo/hawaiian-pizza-isolation-on-transparent-260nw-2618558339.jpg",
        description: "Ветчина, ананасы, моцарелла"
    },
    {
        id: 4,
        name: "Четыре сыра",
        price: 649,
        currency: "RUB",
        image: "https://roosters-pizza.ru/wa-data/public/shop/products/17/00/17/images/946/946.750x0.jpg",
        description: "Моцарелла, дор-блю, пармезан, чеддер"
    }
];

// Отображение пицц
const container = document.getElementById('pizza-container');

pizzas.forEach(pizza => {
    const card = document.createElement('div');
    card.className = 'pizza-card';
    card.innerHTML = `
    <img src="${pizza.image}" alt="${pizza.name}">
    <div class="pizza-name">${pizza.name}</div>
    <div class="pizza-price">${(pizza.price / 100).toFixed(2)} ₽</div>
    <div>${pizza.description}</div>
  `;

    card.addEventListener('click', () => {
        buyPizza(pizza);
    });

    container.appendChild(card);
});

// Функция покупки
function buyPizza(pizza) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = "Открываем оплату...";

    // Открываем инвойс через openInvoice
    tgWebApp.openInvoice({
        title: `Пицца "${pizza.name}"`,
        description: pizza.description,
        currency: pizza.currency,
        prices: [
            { label: "Стоимость", amount: pizza.price * 100 } // ⚠️ В копейках/центах!
        ],
        payload: `order_pizza_${pizza.id}_${Date.now()}`
    });

    // Слушаем закрытие окна оплаты
    tgWebApp.onEvent('invoiceClosed', onInvoiceClosed);
}

// Обработка результата оплаты
function onInvoiceClosed(payload) {
    const statusDiv = document.getElementById('status');

    if (payload.status === 'paid') {
        statusDiv.textContent = '✅ Оплата прошла успешно! Спасибо за заказ!';
        statusDiv.style.color = '#27ae60';
    } else {
        statusDiv.textContent = '❌ Оплата не удалась. Попробуйте снова.';
        statusDiv.style.color = '#e74c3c';
    }

    // Убираем обработчик после использования
    tgWebApp.offEvent('invoiceClosed', onInvoiceClosed);
}

// Поддержка темной темы
tgWebApp.onEvent('themeChanged', () => {
    document.body.style.backgroundColor = tgWebApp.colorScheme === 'dark' ? '#1e1e1e' : '#f5f5f5';
    document.body.style.color = tgWebApp.colorScheme === 'dark' ? '#ffffff' : '#333333';

});
