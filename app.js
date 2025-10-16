const tgWebApp = window.Telegram.WebApp;

// Настройка темы и поведения
tgWebApp.ready();
tgWebApp.expand();

// Установка цвета заголовка и фона под тему Telegram
tgWebApp.setHeaderColor(tgWebApp.themeParams.bg_color || '#ffffff');
tgWebApp.setBackgroundColor(tgWebApp.themeParams.bg_color || '#f5f5f5');

// Данные о пиццах (цены указаны в РУБЛЯХ, как обычно для пользователя)
const pizzas = [
    {
        id: 1,
        name: "Маргарита",
        price: 499, // ⚠️ Это 499 рублей (целое число), НЕ копейки!
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
    // Очищаем цену от лишних пробелов и форматируем
    const formattedPrice = new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
    }).format(pizza.price);

    card.innerHTML = `
        <img src="${pizza.image.trim()}" alt="${pizza.name}" onerror="this.style.display='none'">
        <div class="pizza-name">${pizza.name}</div>
        <div class="pizza-price">${formattedPrice}</div>
        <div class="pizza-desc">${pizza.description}</div>
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
    statusDiv.style.color = "#2980b9";

    // 💡 ВАЖНО: price в рублях → умножаем на 100, чтобы получить копейки
    const amountInCents = pizza.price * 100; // 499 руб → 49900 копеек

    try {
        tgWebApp.openInvoice({
            title: `Пицца "${pizza.name}"`,
            description: pizza.description,
            currency: pizza.currency, // "RUB"
            prices: [
                { label: "Стоимость", amount: amountInCents } // ✅ В копейках!
            ],
            payload: `order_pizza_${pizza.id}_${Date.now()}`
        });
    } catch (error) {
        console.error("Ошибка открытия инвойса:", error);
        statusDiv.textContent = "❌ Не удалось открыть оплату. Попробуйте позже.";
        statusDiv.style.color = "#e74c3c";
        return;
    }

    // Слушаем закрытие окна оплаты
    tgWebApp.onEvent('invoiceClosed', onInvoiceClosed);
}

// Обработка результата оплаты
function onInvoiceClosed(data) {
    const statusDiv = document.getElementById('status');

    if (data.status === 'paid') {
        statusDiv.textContent = '✅ Оплата прошла успешно! Спасибо за заказ!';
        statusDiv.style.color = '#27ae60';
    } else if (data.status === 'failed') {
        statusDiv.textContent = '❌ Оплата не удалась. Попробуйте снова.';
        statusDiv.style.color = '#e74c3c';
    } else if (data.status === 'cancelled') {
        statusDiv.textContent = 'ℹ️ Оплата отменена.';
        statusDiv.style.color = '#f39c12';
    }

    // Убираем обработчик после использования (во избежание дублирования)
    tgWebApp.offEvent('invoiceClosed', onInvoiceClosed);
}

// Поддержка темной темы
tgWebApp.onEvent('themeChanged', () => {
    const bgColor = tgWebApp.themeParams.bg_color || (tgWebApp.colorScheme === 'dark' ? '#1e1e1e' : '#f5f5f5');
    const textColor = tgWebApp.colorScheme === 'dark' ? '#ffffff' : '#333333';

    document.body.style.backgroundColor = bgColor;
    document.body.style.color = textColor;
    tgWebApp.setBackgroundColor(bgColor);
});
