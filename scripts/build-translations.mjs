import fs from 'node:fs';
// Columns: English source | Russian | Ukrainian | German. Brand names are preserved.
const rows = `
Navigation|Навигация|Навігація|Navigation
Contact|Контакты|Контакти|Kontakt
About|Обо мне|Про мене|Über mich
Privacy Policy|Конфиденциальность|Конфіденційність|Datenschutz
Terms of Service|Условия использования|Умови використання|Nutzungsbedingungen
Beats|Биты|Біти|Beats
Mixing|Сведение|Зведення|Mixing
Drum Kits|Драм-киты|Драм-кіти|Drum-Kits
Placements|Релизы|Релізи|Veröffentlichungen
Placement|Релиз|Реліз|Veröffentlichung
Connect|IT-портфолио|IT-портфоліо|IT-Portfolio
Search|Поиск|Пошук|Suche
search beats, kits...|поиск битов, китов...|пошук бітів, кітів...|Beats, Kits suchen...
Search...|Поиск...|Пошук...|Suchen...
Explore now|Смотреть|Переглянути|Entdecken
NEW|НОВОЕ|НОВЕ|NEU
View|Открыть|Відкрити|Ansehen
Trending now|Сейчас в тренде|Зараз у тренді|Aktuell beliebt
Preview|Предпросмотр|Попередній перегляд|Vorschau
Back|Назад|Назад|Zurück
Buy now|Купить|Купити|Jetzt kaufen
Pay with PayPal|Оплатить через PayPal|Сплатити через PayPal|Mit PayPal bezahlen
Listen on Spotify|Слушать в Spotify|Слухати в Spotify|Auf Spotify hören
Contact to purchase|Написать для покупки|Написати для купівлі|Zum Kauf kontaktieren
More like this|Похожие работы|Схожі роботи|Ähnliche Werke
Back to kits|К драм-китам|До драм-кітів|Zurück zu den Kits
Preview (|Предпросмотр (|Попередній перегляд (|Vorschau (
No beats yet. Check back soon.|Битов пока нет. Загляните позже.|Бітів поки немає. Завітайте пізніше.|Noch keine Beats. Schau bald wieder vorbei.
No drum kits yet. Check back soon.|Драм-китов пока нет. Загляните позже.|Драм-кітів поки немає. Завітайте пізніше.|Noch keine Drum-Kits. Schau bald wieder vorbei.
No mixing work yet. Check back soon.|Работ по сведению пока нет.|Робіт зі зведення поки немає.|Noch keine Mixing-Projekte vorhanden.
Nothing matched your search. Try a different keyword.|Ничего не найдено. Попробуйте другой запрос.|Нічого не знайдено. Спробуйте інший запит.|Keine Treffer. Versuche einen anderen Suchbegriff.
Beats & Mixing|Биты и сведение|Біти та зведення|Beats & Mixing
Type in the search bar to find beats, mixing work, placements and drum kits.|Введите запрос, чтобы найти биты, сведение, релизы и драм-киты.|Введіть запит, щоб знайти біти, зведення, релізи та драм-кіти.|Suche nach Beats, Mixing-Projekten, Veröffentlichungen und Drum-Kits.
Producer & Mix Engineer|Продюсер и звукорежиссёр|Продюсер і звукорежисер|Produzent & Mix Engineer
Stop settling for|Хватит выбирать|Досить обирати|Schluss mit
generic sounds.|типовые звуки.|типові звуки.|beliebige Sounds.
outdated 808s.|устаревшие 808.|застарілі 808.|veraltete 808s.
recycled snares.|заезженные снейры.|заїжджені снейри.|verbrauchte Snares.
flat vocals.|плоский вокал.|плаский вокал.|flache Vocals.
boring loops.|скучные лупы.|нудні лупи.|langweilige Loops.
Beats, mixing, drum kits — crafted to inspire your next session.|Биты, сведение и драм-киты — для вдохновения в следующей сессии.|Біти, зведення та драм-кіти — для натхнення в наступній сесії.|Beats, Mixing und Drum-Kits — Inspiration für deine nächste Session.
Explore beats|Слушать биты|Слухати біти|Beats entdecken
Drum kits →|Драм-киты →|Драм-кіти →|Drum-Kits →
Producer & Mix Engineer. I make beats, drum kits, and mix records for artists worldwide. My sound blends trap, new jazz, and experimental textures.|Я продюсер и звукорежиссёр. Создаю биты, драм-киты и свожу треки для артистов со всего мира. Мой звук сочетает трэп, нью-джаз и экспериментальные текстуры.|Я продюсер і звукорежисер. Створюю біти, драм-кіти та зводжу треки для артистів з усього світу. Мій звук поєднує треп, нью-джаз та експериментальні текстури.|Ich produziere Beats, erstelle Drum-Kits und mische Songs für Künstler weltweit. Mein Sound verbindet Trap, New Jazz und experimentelle Texturen.
Whether you need a hard-hitting drum kit, a custom beat, or a clean vocal mix — I've got you covered.|Нужен мощный драм-кит, индивидуальный бит или чистый вокальный микс? Помогу с каждым из них.|Потрібен потужний драм-кіт, індивідуальний біт чи чистий вокальний мікс? Допоможу з кожним із них.|Ob druckvolles Drum-Kit, individueller Beat oder sauberer Vocal-Mix — ich helfe dir dabei.
FAQ|Вопросы и ответы|Запитання та відповіді|FAQ
Frequently Asked Questions|Частые вопросы|Поширені запитання|Häufige Fragen
Who is WUTSHY?|Кто такой WUTSHY?|Хто такий WUTSHY?|Wer ist WUTSHY?
WUTSHY is a music producer and mix engineer. I create beats, drum kits, and provide professional mixing services.|WUTSHY — музыкальный продюсер и звукорежиссёр. Создаю биты, драм-киты и занимаюсь профессиональным сведением.|WUTSHY — музичний продюсер і звукорежисер. Створюю біти, драм-кіти та займаюся професійним зведенням.|WUTSHY ist Musikproduzent und Mix Engineer. Ich erstelle Beats und Drum-Kits und biete professionelles Mixing an.
Are the sounds royalty free?|Можно использовать звуки без роялти?|Чи можна використовувати звуки без роялті?|Sind die Sounds lizenzgebührenfrei?
Yes, all drum kits and beats come with a royalty-free license for your productions.|Да, драм-киты и биты поставляются с лицензией royalty-free для ваших работ.|Так, драм-кіти та біти постачаються з ліцензією royalty-free для ваших робіт.|Ja, alle Drum-Kits und Beats enthalten eine lizenzgebührenfreie Lizenz für deine Produktionen.
How do I purchase a drum kit?|Как купить драм-кит?|Як придбати драм-кіт?|Wie kaufe ich ein Drum-Kit?
Contact me through social media or email. I'll send you a payment link and download access.|Напишите мне в соцсетях или на почту. Пришлю ссылку на оплату и доступ к скачиванию.|Напишіть мені в соцмережах або на пошту. Надішлю посилання на оплату та доступ до завантаження.|Schreib mir per Social Media oder E-Mail. Ich schicke dir den Zahlungslink und den Download-Zugang.
Do you offer mixing services?|Занимаешься сведением?|Чи займаєшся зведенням?|Bietest du Mixing an?
Yes! Send me your stems and I'll deliver a professional mix within 3-5 business days.|Да! Пришлите дорожки, и я подготовлю профессиональный микс за 3–5 рабочих дней.|Так! Надішліть доріжки, і я підготую професійний мікс за 3–5 робочих днів.|Ja! Schick mir deine Spuren. Du bekommst einen professionellen Mix innerhalb von 3–5 Werktagen.
Original productions — from trap to new jazz and beyond.|Авторские биты — от трэпа до нью-джаза и дальше.|Авторські біти — від трепу до нью-джазу й далі.|Eigene Produktionen — von Trap bis New Jazz und darüber hinaus.
Before / After|До / После|До / Після|Vorher / Nachher
Mixing Portfolio|Портфолио сведения|Портфоліо зведення|Mixing-Portfolio
Toggle between the raw take and the mixed & mastered version — the raw preview is shown desaturated on purpose.|Сравните исходную запись и финальный микс с мастерингом. Исходная версия намеренно показана без насыщенных цветов.|Порівняйте початковий запис і фінальний мікс із мастерингом. Початкова версія навмисно показана без насичених кольорів.|Vergleiche die Rohaufnahme mit Mix und Master. Die Rohfassung wird bewusst entsättigt dargestellt.
Custom drums, oneshots, loops & midi — everything you need to cook.|Ударные, ваншоты, лупы и MIDI — всё для твоей музыки.|Ударні, ваншоти, лупи та MIDI — усе для твоєї музики.|Drums, One-Shots, Loops & MIDI — alles für deine nächste Produktion.
Records featuring WUTSHY productions.|Релизы с продакшеном WUTSHY.|Релізи з продакшеном WUTSHY.|Veröffentlichungen mit Produktionen von WUTSHY.
Browse by Category|Найди свой звук|Знайди свій звук|Finde deinen Sound
Discover beats, mixing work, and drum kits — everything in one place.|Биты, сведение и драм-киты — всё в одном месте.|Біти, зведення та драм-кіти — усе в одному місці.|Beats, Mixing und Drum-Kits — alles an einem Ort.
Original productions — trap, new jazz, melodic and more.|Авторские биты: трэп, нью-джаз, мелодика и не только.|Авторські біти: треп, нью-джаз, мелодика й не тільки.|Eigene Produktionen — Trap, New Jazz, Melodic und mehr.
Professional vocal mixing and mastering — before & after.|Профессиональное сведение и мастеринг вокала — до и после.|Професійне зведення та мастеринг вокалу — до й після.|Professionelles Vocal-Mixing und Mastering — vorher & nachher.
Custom drums, oneshots, loops & midi — ready to cook.|Ударные, ваншоты, лупы и MIDI — готовы к работе.|Ударні, ваншоти, лупи та MIDI — готові до роботи.|Drums, One-Shots, Loops & MIDI — bereit für deine Session.
Real records made with WUTSHY sounds.|Реальные релизы со звуками WUTSHY.|Справжні релізи зі звуками WUTSHY.|Echte Veröffentlichungen mit WUTSHY-Sounds.
Featured Beats|Избранные биты|Вибрані біти|Ausgewählte Beats
Find the right sounds for your inspiration.|Найди звуки для своего вдохновения.|Знайди звуки для свого натхнення.|Finde die passenden Sounds für deine Inspiration.
View all beats →|Все биты →|Усі біти →|Alle Beats →
Shop Drum Kits|Магазин драм-китов|Магазин драм-кітів|Drum-Kits entdecken
Find the perfect kit for your next cookup.|Подбери кит для следующего трека.|Добери кіт для наступного треку.|Finde das passende Kit für deinen nächsten Track.
Hear My Sounds in Action|Мои звуки в деле|Мої звуки у справі|Meine Sounds im Einsatz
Watch the latest from WUTSHY|Последнее видео WUTSHY|Останнє відео WUTSHY|Das neueste Video von WUTSHY
Beats, mixing & drum kits.|Биты, сведение и драм-киты.|Біти, зведення та драм-кіти.|Beats, Mixing & Drum-Kits.
For beats, mixing services, or drum kit purchases — reach out via email or socials.|По вопросам битов, сведения и покупки драм-китов — пишите на почту или в соцсети.|Щодо бітів, зведення та купівлі драм-кітів — пишіть на пошту або в соцмережі.|Für Beats, Mixing oder Drum-Kits — schreib mir per E-Mail oder Social Media.
© 2026 WUTSHY. All rights reserved.|© 2026 WUTSHY. Все права защищены.|© 2026 WUTSHY. Усі права захищено.|© 2026 WUTSHY. Alle Rechte vorbehalten.
Studio / Admin|Студия / Управление|Студія / Керування|Studio / Verwaltung
Back to site|На сайт|На сайт|Zur Website
Logout|Выйти|Вийти|Abmelden
Cancel|Отмена|Скасувати|Abbrechen
Dashboard|Обзор|Огляд|Übersicht
Works|Работы|Роботи|Werke
Settings|Настройки|Налаштування|Einstellungen
Site Texts|Тексты сайта|Тексти сайту|Website-Texte
Workspace / Overview|Студия / Обзор|Студія / Огляд|Arbeitsbereich / Übersicht
View website|Открыть сайт|Відкрити сайт|Website ansehen
Your creative space.|Твоя творческая студия.|Твоя творча студія.|Dein kreativer Raum.
Welcome back, WUTSHY. Manage your portfolio from here.|С возвращением, WUTSHY. Управляй портфолио отсюда.|З поверненням, WUTSHY. Керуй портфоліо звідси.|Willkommen zurück, WUTSHY. Verwalte hier dein Portfolio.
Quick Actions|Быстрые действия|Швидкі дії|Schnellaktionen
Add Beat|Добавить бит|Додати біт|Beat hinzufügen
Add Mix|Добавить сведение|Додати зведення|Mix hinzufügen
Add Drum Kit|Добавить драм-кит|Додати драм-кіт|Drum-Kit hinzufügen
Total Works|Всего работ|Усього робіт|Werke insgesamt
Featured|Избранное|Вибране|Hervorgehoben
Make it yours|Твои тексты|Твої тексти|Deine Texte
Fine-tune your site|Настрой сайт|Налаштуй сайт|Website anpassen
The other side|Другая сторона|Інша сторона|Die andere Seite
Loading...|Загрузка...|Завантаження...|Wird geladen...
Saving...|Сохранение...|Збереження...|Wird gespeichert...
Save|Сохранить|Зберегти|Speichern
Save changes|Сохранить изменения|Зберегти зміни|Änderungen speichern
Saved!|Сохранено!|Збережено!|Gespeichert!
Delete|Удалить|Видалити|Löschen
Edit|Редактировать|Редагувати|Bearbeiten
Close|Закрыть|Закрити|Schließen
New kit|Новый кит|Новий кіт|Neues Kit
Edit kit|Редактировать кит|Редагувати кіт|Kit bearbeiten
New work|Новая работа|Нова робота|Neues Werk
Edit work|Редактировать работу|Редагувати роботу|Werk bearbeiten
No kits yet. Create your first one.|Китов пока нет. Создай первый.|Кітів поки немає. Створи перший.|Noch keine Kits. Erstelle dein erstes.
Nothing here yet. Add your first work.|Пока пусто. Добавь первую работу.|Поки порожньо. Додай першу роботу.|Noch nichts hier. Füge dein erstes Werk hinzu.
Kits, tracklists, pricing and buy links.|Киты, треклисты, цены и ссылки на покупку.|Кіти, треклисти, ціни та посилання на купівлю.|Kits, Tracklisten, Preise und Kauflinks.
Beats, mixing portfolio, and placements.|Биты, сведение и релизы.|Біти, зведення та релізи.|Beats, Mixing-Portfolio und Veröffentlichungen.
tracks|треков|треків|Tracks
Tracklist (|Треклист (|Треклист (|Trackliste (
+ Add track|+ Добавить трек|+ Додати трек|+ Track hinzufügen
Email|Электронная почта|Електронна пошта|E-Mail
Password|Пароль|Пароль|Passwort
Sign in to manage your site|Войдите для управления сайтом|Увійдіть для керування сайтом|Melde dich zur Website-Verwaltung an
Sign in|Войти|Увійти|Anmelden
Signing in...|Вход...|Вхід...|Anmeldung...
Demo mode: admin / wutshy|Демо: admin / wutshy|Демо: admin / wutshy|Demo: admin / wutshy
Type|Тип|Тип|Typ
Sort order|Порядок сортировки|Порядок сортування|Sortierreihenfolge
Title|Название|Назва|Titel
Description|Описание|Опис|Beschreibung
Price|Цена|Ціна|Preis
Currency|Валюта|Валюта|Währung
Key|Тональность|Тональність|Tonart
Artist / For (optional)|Артист / Для кого (необязательно)|Артист / Для кого (необов'язково)|Künstler / Für wen (optional)
Cover image|Обложка|Обкладинка|Coverbild
Animated cover (gif / mp4)|Анимированная обложка (gif / mp4)|Анімована обкладинка (gif / mp4)|Animiertes Cover (gif / mp4)
Animated cover (gif / mp4 — plays while track plays)|Анимированная обложка (gif / mp4 — при воспроизведении)|Анімована обкладинка (gif / mp4 — під час відтворення)|Animiertes Cover (gif / mp4 — während der Wiedergabe)
Audio — BEFORE (raw)|Аудио — ДО (исходник)|Аудіо — ДО (оригінал)|Audio — VORHER (roh)
Audio — AFTER (mixed)|Аудио — ПОСЛЕ (микс)|Аудіо — ПІСЛЯ (мікс)|Audio — NACHHER (Mix)
Audio|Аудио|Аудіо|Audio
audio|аудио|аудіо|Audio
Beat|Бит|Біт|Beat
Track|Трек|Трек|Track
Playlist|Плейлист|Плейліст|Playlist
Album|Альбом|Альбом|Album
Spotify type|Тип Spotify|Тип Spotify|Spotify-Typ
Spotify URL|Ссылка Spotify|Посилання Spotify|Spotify-URL
Tags (comma separated)|Теги через запятую|Теги через кому|Tags (kommagetrennt)
Accent color|Акцентный цвет|Акцентний колір|Akzentfarbe
Featured on homepage|На главной странице|На головній сторінці|Auf der Startseite hervorheben
Buy link (optional)|Ссылка на покупку (необязательно)|Посилання на купівлю (необов'язково)|Kauflink (optional)
NEW badge|Значок НОВОЕ|Позначка НОВЕ|NEU-Label
Track title|Название трека|Назва треку|Tracktitel
sec|сек|сек|Sek.
Delete track|Удалить трек|Видалити трек|Track löschen
Delete work|Удалить работу|Видалити роботу|Werk löschen
Delete drum kit|Удалить драм-кит|Видалити драм-кіт|Drum-Kit löschen
Are you sure?|Вы уверены?|Ви впевнені?|Bist du sicher?
Payments, socials, video and Telegram bot. Site texts are in Site Texts.|Оплата, соцсети, видео и Telegram-бот. Тексты — в разделе «Тексты сайта».|Оплата, соцмережі, відео та Telegram-бот. Тексти — у розділі «Тексти сайту».|Zahlungen, Social Media, Video und Telegram-Bot. Texte findest du unter Website-Texte.
PayPal payments|Оплата PayPal|Оплата PayPal|PayPal-Zahlungen
Featured video (homepage)|Видео на главной|Відео на головній|Video auf der Startseite
Social links|Социальные сети|Соціальні мережі|Social-Media-Links
Toggle each link on/off. Only enabled links appear in the footer.|Включайте нужные ссылки. Внизу сайта видны только включённые.|Увімкніть потрібні посилання. Унизу сайту видно лише ввімкнені.|Aktiviere die gewünschten Links. Nur aktive Links erscheinen im Footer.
Telegram bot|Telegram-бот|Telegram-бот|Telegram-Bot
Upload tracks to the site via Telegram. Bot starts with|Загружайте треки через Telegram. Команда запуска:|Завантажуйте треки через Telegram. Команда запуску:|Lade Tracks über Telegram hoch. Startbefehl:
. Restart after saving.|. После сохранения перезапустите.|. Після збереження перезапустіть.|. Nach dem Speichern neu starten.
Bot commands:|Команды бота:|Команди бота:|Bot-Befehle:
/addbeat — upload a new beat|/addbeat — загрузить бит|/addbeat — завантажити біт|/addbeat — Beat hochladen
/addmix — upload mixing work|/addmix — загрузить сведение|/addmix — завантажити зведення|/addmix — Mix hochladen
/list — show recent works|/list — последние работы|/list — останні роботи|/list — letzte Werke anzeigen
/delete <id> — delete a work|/delete <id> — удалить работу|/delete <id> — видалити роботу|/delete <id> — Werk löschen
/cancel — cancel current upload|/cancel — отменить загрузку|/cancel — скасувати завантаження|/cancel — Upload abbrechen
Email for contact & purchases|Почта для связи и покупок|Пошта для зв'язку та покупок|E-Mail für Kontakt und Käufe
Show email in footer|Показывать почту внизу сайта|Показувати пошту внизу сайту|E-Mail im Footer anzeigen
Enable PayPal buttons on product pages|Включить PayPal на страницах товаров|Увімкнути PayPal на сторінках товарів|PayPal auf Produktseiten aktivieren
PayPal email|Почта PayPal|Пошта PayPal|PayPal-E-Mail
Your PayPal.me or business email|PayPal.me или рабочая почта|PayPal.me або робоча пошта|PayPal.me oder geschäftliche E-Mail
Show featured video on homepage|Показать видео на главной|Показати відео на головній|Video auf der Startseite anzeigen
YouTube URL|Ссылка YouTube|Посилання YouTube|YouTube-URL
Section title (optional)|Заголовок раздела (необязательно)|Заголовок розділу (необов'язково)|Abschnittstitel (optional)
Featured Video|Избранное видео|Вибране відео|Ausgewähltes Video
Enable Telegram bot|Включить Telegram-бота|Увімкнути Telegram-бота|Telegram-Bot aktivieren
Bot token|Токен бота|Токен бота|Bot-Token
From @BotFather|Из @BotFather|З @BotFather|Von @BotFather
Your Telegram chat ID|Ваш Telegram chat ID|Ваш Telegram chat ID|Deine Telegram-Chat-ID
Send /start to @userinfobot to get your ID|Отправьте /start боту @userinfobot, чтобы узнать ID|Надішліть /start боту @userinfobot, щоб дізнатися ID|Sende /start an @userinfobot, um deine ID zu erhalten
Edit all copy on the homepage, about page, footer, and legal pages.|Редактируй тексты главной страницы, раздела обо мне, подвала и юридических страниц.|Редагуй тексти головної сторінки, розділу про мене, футера та юридичних сторінок.|Bearbeite Texte für Startseite, Über mich, Footer und rechtliche Seiten.
Hero (homepage)|Первый экран|Перший екран|Hero (Startseite)
Tagline|Краткое описание|Короткий опис|Kurzbeschreibung
Title — first line|Заголовок — первая строка|Заголовок — перший рядок|Titel — erste Zeile
Rotating phrases|Сменяющиеся фразы|Змінні фрази|Wechselnde Texte
One phrase per line (animated gradient text)|Одна фраза на строку (анимированный градиент)|Одна фраза на рядок (анімований градієнт)|Eine Phrase pro Zeile (animierter Farbverlauf)
Subtitle|Подзаголовок|Підзаголовок|Untertitel
Primary button|Основная кнопка|Основна кнопка|Primärer Button
Secondary button|Вторая кнопка|Друга кнопка|Sekundärer Button
About page|Страница обо мне|Сторінка про мене|Über-mich-Seite
Section label|Метка раздела|Позначка розділу|Abschnittslabel
Paragraph 1|Абзац 1|Абзац 1|Absatz 1
Paragraph 2|Абзац 2|Абзац 2|Absatz 2
FAQ (about page)|Вопросы и ответы|Запитання та відповіді|FAQ (Über mich)
Question|Вопрос|Запитання|Frage
Answer|Ответ|Відповідь|Antwort
Add question|Добавить вопрос|Додати запитання|Frage hinzufügen
Homepage sections|Разделы главной|Розділи головної|Startseitenabschnitte
Browse by category — title|Категории — заголовок|Категорії — заголовок|Kategorien — Titel
Browse by category — subtitle|Категории — подзаголовок|Категорії — підзаголовок|Kategorien — Untertitel
Featured beats — title|Избранные биты — заголовок|Вибрані біти — заголовок|Ausgewählte Beats — Titel
Featured beats — subtitle|Избранные биты — подзаголовок|Вибрані біти — підзаголовок|Ausgewählte Beats — Untertitel
Featured beats — button|Избранные биты — кнопка|Вибрані біти — кнопка|Ausgewählte Beats — Button
Shop drum kits — title|Драм-киты — заголовок|Драм-кіти — заголовок|Drum-Kits — Titel
Shop drum kits — subtitle|Драм-киты — подзаголовок|Драм-кіти — підзаголовок|Drum-Kits — Untertitel
Placements section — title|Релизы — заголовок|Релізи — заголовок|Veröffentlichungen — Titel
Placements section — subtitle|Релизы — подзаголовок|Релізи — підзаголовок|Veröffentlichungen — Untertitel
Featured video — subtitle|Видео — подзаголовок|Відео — підзаголовок|Video — Untertitel
Page headers|Заголовки страниц|Заголовки сторінок|Seitentitel
Mixing page|Страница сведения|Сторінка зведення|Mixing-Seite
Label|Метка|Позначка|Label
Footer|Подвал сайта|Футер сайту|Footer
Tagline (under logo)|Подпись под логотипом|Підпис під логотипом|Text unter dem Logo
Contact block text|Текст контактов|Текст контактів|Kontakttext
Copyright|Авторские права|Авторські права|Urheberrecht
Page title|Заголовок страницы|Заголовок сторінки|Seitentitel
Content|Содержимое|Вміст|Inhalt
Separate paragraphs with a blank line|Разделяйте абзацы пустой строкой|Розділяйте абзаци порожнім рядком|Absätze durch Leerzeilen trennen
Ideas.|Идеи.|Ідеї.|Ideen.
Code.|Код.|Код.|Code.
Connection.|Связь.|Зв'язок.|Verbindung.
View projects|Смотреть проекты|Переглянути проєкти|Projekte ansehen
01 — CREATIVE DEVELOPMENT|01 — ТВОРЧЕСКАЯ РАЗРАБОТКА|01 — ТВОРЧА РОЗРОБКА|01 — KREATIVE ENTWICKLUNG
MUSIC × TECHNOLOGY|МУЗЫКА × ТЕХНОЛОГИИ|МУЗИКА × ТЕХНОЛОГІЇ|MUSIK × TECHNOLOGIE
Built with curiosity ↗|Создано с любопытством ↗|Створено з цікавістю ↗|Aus Neugier gebaut ↗
01 / SELECTED WORK|01 / ИЗБРАННЫЕ ПРОЕКТЫ|01 / ВИБРАНІ ПРОЄКТИ|01 / AUSGEWÄHLTE PROJEKTE
From idea to project.|Из идеи в проект.|Від ідеї до проєкту.|Von der Idee zum Projekt.
Source code|Исходный код|Вихідний код|Quellcode
— Music Portfolio|— Музыкальное портфолио|— Музичне портфоліо|— Musikportfolio
Web development|Веб-разработка|Веброзробка|Webentwicklung
PROJECT PREVIEW|ПРЕДПРОСМОТР|ПОПЕРЕДНІЙ ПЕРЕГЛЯД|PROJEKTVORSCHAU
View project|Открыть проект|Відкрити проєкт|Projekt ansehen
Try it right here|Попробуй прямо здесь|Спробуй просто тут|Hier ausprobieren
This is a scripted preview with sample data. Actions stay in your browser; no messages are sent to Telegram or Discord.|Это сценарное демо с примерами данных. Действия остаются в браузере: сообщения в Telegram и Discord не отправляются.|Це сценарне демо з прикладами даних. Дії залишаються в браузері: повідомлення в Telegram і Discord не надсилаються.|Dies ist eine geskriptete Vorschau mit Beispieldaten. Aktionen bleiben im Browser; es werden keine Nachrichten an Telegram oder Discord gesendet.
interactive preview|интерактивное демо|інтерактивне демо|interaktive Vorschau
Restart demo|Начать заново|Почати знову|Demo neu starten
Demo conversation|Демонстрационный чат|Демонстраційний чат|Demo-Chat
typing…|печатает…|друкує…|schreibt…
Choose a button to try the bot. No login needed.|Нажми кнопку. Вход не нужен.|Натисни кнопку. Вхід не потрібен.|Wähle einen Button. Keine Anmeldung nötig.
Weekly meals, shared shopping lists and a little less everyday chaos.|Меню на неделю, общие списки покупок и чуть меньше повседневного хаоса.|Меню на тиждень, спільні списки покупок і трохи менше щоденного хаосу.|Wochenpläne, gemeinsame Einkaufslisten und etwas weniger Alltagschaos.
Personal programs, guided workouts and progress you can follow.|Личные программы, пошаговые тренировки и наглядный прогресс.|Особисті програми, покрокові тренування та наочний прогрес.|Eigene Programme, geführte Workouts und nachvollziehbare Fortschritte.
Accept a match and run your hero profile from a hotkey or Telegram.|Принимай матч и запускай профиль героя горячей клавишей или из Telegram.|Приймай матч і запускай профіль героя гарячою клавішею або з Telegram.|Nimm ein Match an und starte dein Heldenprofil per Hotkey oder Telegram.
One panel. Your voice channel. Mute and unmute with administrator controls.|Одна панель для голосового канала. Выключай и включай микрофоны с правами администратора.|Одна панель для голосового каналу. Вимикай і вмикай мікрофони з правами адміністратора.|Ein Panel für deinen Sprachkanal. Mitglieder mit Admin-Rechten stumm- und freischalten.
Anime cards, personal lists and forum discussions in your community.|Карточки аниме, личные списки и обсуждения на форуме сообщества.|Картки аніме, особисті списки та обговорення на форумі спільноти.|Anime-Karten, persönliche Listen und Forendiskussionen für deine Community.
An inventory in the palm of your hand. A first-person Spatial GUI add-on.|Инвентарь на ладони. Дополнение Spatial GUI для вида от первого лица.|Інвентар на долоні. Доповнення Spatial GUI для вигляду від першої особи.|Das Inventar in deiner Hand. Ein Spatial-GUI-Add-on aus der Egoperspektive.
Today's menu|Меню на сегодня|Меню на сьогодні|Heutiges Menü
Shopping list|Список покупок|Список покупок|Einkaufsliste
Weekly plan|Меню на неделю|Меню на тиждень|Wochenplan
Start workout|Начать тренировку|Почати тренування|Training starten
Record a set|Записать подход|Записати підхід|Satz aufzeichnen
My progress|Мой прогресс|Мій прогрес|Mein Fortschritt
Accept match|Принять матч|Прийняти матч|Match annehmen
Hero profile|Профиль героя|Профіль героя|Heldenprofil
Stop action|Остановить действие|Зупинити дію|Aktion stoppen
Mute All|Выключить всем микрофон|Вимкнути всім мікрофон|Alle stummschalten
Unmute All|Включить всем микрофон|Увімкнути всім мікрофон|Alle freischalten
Anime card|Карточка аниме|Картка аніме|Anime-Karte
Add to my list|В мой список|До мого списку|Zu meiner Liste
Forum topic|Тема на форуме|Тема на форумі|Forenthema
Interactive concept|Интерактивный концепт|Інтерактивний концепт|Interaktives Konzept
Inventory|Инвентарь|Інвентар|Inventar
Slot|Слот|Слот|Platz
Equipment & crafting|Экипировка и крафт|Спорядження та крафт|Ausrüstung & Crafting
Inventory closed|Инвентарь закрыт|Інвентар закрито|Inventar geschlossen
Close inventory|Закрыть инвентарь|Закрити інвентар|Inventar schließen
Open inventory|Открыть инвентарь|Відкрити інвентар|Inventar öffnen
Equipment panel|Панель экипировки|Панель спорядження|Ausrüstungspanel
Vanilla style|Обычный стиль|Звичайний стиль|Vanilla-Stil
Holographic style|Голографический стиль|Голографічний стиль|Holografischer Stil
Select an item, then a slot to move it. Stylized web demo, not the game.|Выбери предмет, затем слот. Это стилизованное веб-демо, а не игра.|Вибери предмет, потім слот. Це стилізоване вебдемо, а не гра.|Wähle einen Gegenstand und dann einen Platz. Stilisierte Webdemo, nicht das Spiel.
`;
const dictionary = {};
function addRows(text) { for (const row of text.trim().split('\n')) { const [en, ru, uk, de] = row.split('|'); if (!de) throw new Error('Incomplete translation: ' + row); dictionary[en] = [ru, uk, en, de]; } }
addRows(rows);
addRows(fs.readFileSync('scripts/demo-translations.txt', 'utf8'));
const extra = JSON.parse(fs.readFileSync('scripts/translation-extras.json', 'utf8'));
Object.assign(dictionary, extra);
fs.writeFileSync('src/lib/translations.json', JSON.stringify(dictionary, null, 2) + '\n');
