// One-off dev seed script — run with `node seed-local.js` from the backend
// repo root (or paste into a Render Shell session for the backend service).
// Populates the Postgres DB pointed to by DATABASE_URL (falls back to local
// Postgres) with sample rows so the frontend has something to render.
// Not part of the app; safe to delete.
const { Client } = require("pg");

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://postgres:001007@localhost:5432/uzchess";

const client = new Client({
  connectionString,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false,
});

async function main() {
  await client.connect();

  // Players
  const players = [
    ["Sardor Karimov", "uz", "gm", 2650, 2600, 2550],
    ["Aziz Yusupov", "uz", "im", 2480, 2420, 2390],
    ["Jasur Tashkentov", "uz", "fm", 2350, 2300, 2280],
    ["Dilnoza Rashidova", "uz", "wgm", 2410, 2380, 2360],
    ["Otabek Nazarov", "uz", "cm", 2210, 2190, 2170],
    ["Kamila Yuldasheva", "uz", "wim", 2300, 2270, 2250],
  ];
  const playerIds = [];
  for (const [name, country, title, classical, rapid, blitz] of players) {
    const res = await client.query(
      `INSERT INTO players (name, country, title, "classicalRating", "rapidRating", "blitzRating")
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
      [name, country, title, classical, rapid, blitz]
    );
    playerIds.push(res.rows[0].id);
  }

  // Games
  for (let i = 0; i < 4; i++) {
    const white = playerIds[i % playerIds.length];
    const black = playerIds[(i + 1) % playerIds.length];
    await client.query(
      `INSERT INTO games ("whitePlayerId","blackPlayerId","whiteScore","blackScore","gameType","movesCount","playedAt")
       VALUES ($1,$2,$3,$4,$5,$6, now() - ($7 || ' days')::interval)`,
      [white, black, i % 2 === 0 ? 1 : 0, i % 2 === 0 ? 0 : 1, ["rapid", "blitz", "bullet"][i % 3], 30 + i * 5, i]
    );
  }

  // Game of the day
  await client.query(
    `INSERT INTO "gamesOfDay" ("videoUrl","thumbnailUrl","durationSeconds","liveStartTime","gameType","whitePlayerId","blackPlayerId","isActive")
     VALUES ($1,$2,$3, now(), $4, $5, $6, true)`,
    [
      "https://www.youtube.com/watch?v=9-HH_ciP9YQ",
      "/game-of-day/thumbnail.png",
      2400,
      "rapid",
      playerIds[0],
      playerIds[1],
    ]
  );

  // Real assets pulled from the UzChess Figma file (see CLAUDE.md's Figma
  // link) via the figma MCP tools, saved under frontend/public/ and served
  // as relative paths — the frontend and this local backend run on the same
  // origin in dev, so these resolve correctly without needing R2 uploads.
  // Swap for real backend-uploaded assets once the backend has actual
  // news/course/book imagery — this is dev seed data only.

  // News — 13 chess-related articles with real body copy (not one-liners).
  // The first 3 use the real Figma news photos (news-1..3); the other 10
  // each get a distinct real chess photo pulled from Wikimedia Commons
  // (news-6..15 — public domain / freely licensed, downloaded via
  // Special:FilePath, not hotlinked) so no two articles share an image.
  const newsItems = [
    ["UzChess milliy chempionati boshlandi", "Toshkentda yillik milliy shaxmat chempionati start oldi — mamlakatning eng kuchli 64 nafar shaxmatchisi bosh sovrin uchun kurashmoqda.", "Toshkent shahridagi Respublika shaxmat markazida yillik milliy chempionat o'z ishini boshladi. Musobaqada mamlakatning turli viloyatlaridan kelgan 64 nafar eng kuchli shaxmatchi ishtirok etmoqda, ular orasida bir nechta xalqaro grossmeyster va vasta unvoniga ega sportchilar ham bor.\n\nChempionat to'qqiz tur davomida shveytsariya tizimida o'tkaziladi, har bir partiyaga 90 daqiqa vaqt beriladi. Tashkilotchilarning ma'lum qilishicha, g'olib O'zbekiston terma jamoasining navbatdagi xalqaro turnirlarga tayyorgarlik safiga qo'shiladi.\n\nMusobaqaning yopilish marosimi va sovrinlarni topshirish tadbiri ikki hafta ichida bo'lib o'tishi rejalashtirilgan.", "/news/news-1.png"],
    ["Yosh shaxmatchilar uchun yangi kurs ochildi", "Boshlang'ich va o'rta daraja uchun mo'ljallangan yangi video kurslar platformaga qo'shildi — endilikda har bir bola uyida turib professional murabbiylardan saboq olishi mumkin.", "UzChess platformasida yosh shaxmatchilar uchun mo'ljallangan yangi video kurslar seriyasi e'lon qilindi. Kurslar boshlang'ich, o'rta va professional darajalarga bo'lingan bo'lib, har biri debyut nazariyasi, mittelshpil strategiyasi va endshpil texnikasi bo'yicha alohida bo'limlarni o'z ichiga oladi.\n\nDasturni tayyorlashda respublika terma jamoasining murabbiylari va xalqaro grossmeysterlar jalb qilingan. Har bir dars amaliy mashqlar va interaktiv testlar bilan yakunlanadi, bu esa o'quvchining bilim darajasini real vaqt rejimida baholash imkonini beradi.\n\nKurslarga yozilish uchun platformada ro'yxatdan o'tish va tegishli bo'limni tanlash kifoya.", "/news/news-2.png"],
    ["UzChess reytingi yangilandi", "FIDE reytinglari asosida milliy reyting jadvali yangilandi — so'nggi oyda bir nechta yosh shaxmatchi o'nlikka birinchi marta kirib keldi.", "Xalqaro Shaxmat Federatsiyasi (FIDE)ning navbatdagi reyting yangilanishi asosida UzChess platformasidagi milliy reyting jadvali ham yangilandi. So'nggi turnirlar natijalariga ko'ra, bir nechta yosh shaxmatchi birinchi marta milliy reytingning eng yaxshi o'n nafari qatoriga kirishga muvaffaq bo'ldi.\n\nReyting o'zgarishlari klassik, blits va rapid toifalari bo'yicha alohida hisoblanadi. Platforma foydalanuvchilari endilikda o'z profillarida shaxsiy reyting dinamikasini grafik ko'rinishida kuzatib borishlari mumkin.\n\nKeyingi yangilanish navbatdagi xalqaro turnirlar yakunlangach amalga oshiriladi.", "/news/news-3.png"],
    ["Toshkentda xalqaro blits turniri yakunlandi", "Ikki kun davomida o'tkazilgan xalqaro blits turnirida o'nlab mamlakat vakillari ishtirok etdi, g'alabani mahalliy grossmeyster qo'lga kiritdi.", "Toshkentda o'tkazilgan an'anaviy xalqaro blits turniri o'z yakuniga yetdi. Ikki kun davomida davom etgan musobaqada O'zbekiston, Qozog'iston, Rossiya, Hindiston va boshqa o'nga yaqin mamlakat vakillari kuch sinashdi.\n\nHar bir partiyaga uch daqiqadan vaqt berilgan tezkor formatda o'tkazilgan turnirda mahalliy grossmeyster yakuniy bosqichda raqibini mag'lub etib, bosh sovrinni qo'lga kiritdi. Tashkilotchilar bunday turnirlarni yiliga bir necha marta o'tkazishni rejalashtirmoqda.", "/news/news-12.jpg"],
    ["O'zbekiston terma jamoasi Shaxmat Olimpiadasiga tayyorgarlik ko'rmoqda", "Milliy terma jamoa navbatdagi Butunjahon Shaxmat Olimpiadasi oldidan intensiv mashg'ulotlar tsikliga kirishdi.", "O'zbekiston milliy terma jamoasi navbatdagi Butunjahon Shaxmat Olimpiadasida ishtirok etishga tayyorgarlik ko'rishni boshladi. Jamoa tarkibiga mamlakatning eng tajribali grossmeysterlari va istiqbolli yosh shaxmatchilari kiritilgan.\n\nMashg'ulotlar dasturi jismoniy tayyorgarlik, psixologik barqarorlik va zamonaviy debyut tahlillarini o'z ichiga oladi. Murabbiylar jamoasi so'nggi yillardagi eng kuchli raqiblarning o'yin uslubini har tomonlama o'rganib chiqmoqda.", "/news/news-6.jpg"],
    ["Ayollar o'rtasida respublika chempionati start oldi", "Mamlakatning eng kuchli ayol shaxmatchilari respublika chempionati doirasida bosh sovrin uchun kurash boshladi.", "Respublika ayollar o'rtasidagi shaxmat chempionati o'z ishini boshladi. Musobaqada milliy terma jamoa a'zolari, shu jumladan bir nechta xalqaro vasta va vim unvoniga ega sportchilar ishtirok etmoqda.\n\nTashkilotchilarning ta'kidlashicha, so'nggi yillarda ayollar shaxmatiga bo'lgan qiziqish sezilarli darajada oshgan — musobaqa ishtirokchilari soni o'tgan yilgiga nisbatan ikki barobarga ko'paydi. Chempionat g'olibasi milliy terma jamoa safida xalqaro musobaqalarda mamlakatni himoya qilish huquqini qo'lga kiritadi.", "/news/news-7.jpg"],
    ["Yosh iste'dodlar uchun onlayn turnir e'lon qilindi", "16 yoshgacha bo'lgan shaxmatchilar uchun mo'ljallangan onlayn turnir ro'yxatdan o'tishni boshladi.", "UzChess platformasi 16 yoshgacha bo'lgan yosh shaxmatchilar uchun onlayn turnir tashkil etayotganini ma'lum qildi. Turnir rapid formatida, bir necha bosqichda o'tkaziladi va istagan hudud vakili qatnashishi mumkin.\n\nTashkilotchilarning maqsadi — hududlardagi iste'dodli bolalarni aniqlash va ularni milliy yosh terma jamoalarga jalb qilish. G'oliblar UzChess platformasidan bepul kurs obunasi va diplomlar bilan taqdirlanadi.", "/news/news-8.jpg"],
    ["Buyuk ustozlar: Bobbi Fisherning eng mashhur partiyasi tahlili", "Platformaning yangi tahliliy bo'limida shaxmat tarixidagi eng mashhur partiyalardan biri qadam-baqadam yoritildi.", "UzChess platformasining \"Buyuk ustozlar\" rukni doirasida shaxmat tarixidagi eng mashhur partiyalardan biri — Bobbi Fisherning \"Asr partiyasi\" deb nom olgan o'yini batafsil tahlil qilindi. Maqolada har bir yurish ortidagi strategik g'oya sodda tilda tushuntirilgan.\n\nMualliflarning ta'kidlashicha, bunday tarixiy partiyalarni o'rganish yosh shaxmatchilarga pozitsion o'ylashni va uzoq muddatli rejalashtirishni o'rgatishning eng samarali usullaridan biri hisoblanadi. Rukn doirasida keyingi maqolalar ham chop etilishi rejalashtirilgan.", "/news/news-9.jpg"],
    ["UzChess platformasida yangi endshpil darsligi chop etildi", "Ladya va piyodali endshpillarga bag'ishlangan yangi interaktiv darslik platformaga qo'shildi.", "Kutubxona bo'limiga ladya va piyodali endshpillar texnikasiga bag'ishlangan yangi interaktiv darslik qo'shildi. Darslik nazariy qism bilan bir qatorda amaliy mashqlar va o'z-o'zini tekshirish testlarini ham o'z ichiga oladi.\n\nMualliflarning fikricha, aksariyat havaskor shaxmatchilar aynan endshpil bosqichida ko'proq xato qiladi, shu sababli ushbu bosqichni chuqur o'rganish reyting o'sishiga sezilarli ta'sir ko'rsatadi. Darslik barcha til versiyalarida mavjud.", "/news/news-10.jpg"],
    ["Shaxmat murabbiylari uchun sertifikatlash dasturi boshlandi", "Milliy federatsiya murabbiylarni malaka darajasiga ko'ra sertifikatlash bo'yicha yangi dastur ishga tushirdi.", "O'zbekiston shaxmat federatsiyasi murabbiylarni malaka darajasiga ko'ra sertifikatlash bo'yicha yangi dasturni e'lon qildi. Dastur uch bosqichdan iborat bo'lib, nazariy imtihon, amaliy dars o'tkazish va yakuniy attestatsiyani o'z ichiga oladi.\n\nTashkilotchilarning maqsadi — mamlakat bo'ylab shaxmat to'garaklarida dars beruvchi murabbiylar tayyorgarligining yagona standartini joriy etish. Sertifikatlangan murabbiylar ro'yxati UzChess platformasida e'lon qilib boriladi.", "/news/news-15.jpg"],
    ["Maktablarda shaxmat darslari joriy etilmoqda", "Bir qator umumta'lim maktablarida haftalik dastur sifatida shaxmat darslari sinov tariqasida joriy etildi.", "Poytaxt va bir nechta viloyat maktablarida shaxmatni haftalik fan sifatida o'qitish bo'yicha sinov loyihasi boshlandi. Loyiha doirasida boshlang'ich sinf o'quvchilariga asosiy qoidalar, taktik usullar va sport odobi o'rgatiladi.\n\nTa'lim vazirligi vakillarining ma'lum qilishicha, loyiha natijalari ijobiy bo'lsa, kelgusi o'quv yilidan boshlab dastur mamlakat bo'ylab kengaytiriladi. Darslar uchun maxsus o'quv qo'llanmalari UzChess federatsiyasi mutaxassislari tomonidan tayyorlangan.", "/news/news-11.jpg"],
    ["Norvegiya shaxmat festivalida O'zbekiston vakili g'alaba qozondi", "Yosh grossmeysterimiz xalqaro festivalning ochiq toifasida birinchi o'rinni qo'lga kiritdi.", "Norvegiyada o'tkazilgan an'anaviy xalqaro shaxmat festivalining ochiq toifasida O'zbekiston vakili birinchi o'rinni qo'lga kiritdi. Turnirda dunyoning 40 dan ortiq mamlakatidan yuzlab shaxmatchi ishtirok etgan edi.\n\nG'alaba mamlakat shaxmat tarixida ushbu festivalda qo'lga kiritilgan eng yuqori natijalardan biri hisoblanadi. Sportchi qaytib kelgach, milliy terma jamoa safida navbatdagi xalqaro musobaqalarga tayyorgarlik ko'rishni davom ettiradi.", "/news/news-13.jpg"],
    ["Sun'iy intellekt va shaxmat: zamonaviy tahlil dasturlari haqida", "Zamonaviy shaxmat dvijoklari qanday ishlashi va ulardan mashg'ulotlarda qanday foydalanish mumkinligi haqida sharh.", "So'nggi yillarda sun'iy intellektga asoslangan shaxmat dvijoklari professional tayyorgarlik jarayonining ajralmas qismiga aylandi. Ushbu maqolada zamonaviy tahlil dasturlarining ishlash prinsipi va ulardan shaxsiy mashg'ulotlarda qanday to'g'ri foydalanish mumkinligi haqida so'z boradi.\n\nMutaxassislarning ta'kidlashicha, dvijoklardan faqat xatolarni topish uchun emas, balki o'z g'oyalarini tekshirish va yangi strategik yechimlarni izlash uchun foydalanish eng samarali yondashuv hisoblanadi. UzChess platformasi yaqin kelajakda o'z tahlil vositasini ham taqdim etishni rejalashtirmoqda.", "/news/news-14.png"],
  ];
  for (const [title, excerpt, content, imageUrl] of newsItems) {
    await client.query(
      `INSERT INTO news (title, excerpt, content, "imageUrl", "publishedAt", "viewsCount")
       VALUES ($1,$2,$3,$4, now(), $5)`,
      [title, excerpt, content, imageUrl, Math.floor(Math.random() * 500)]
    );
  }

  // Banners
  await client.query(
    `INSERT INTO banners (title, subtitle, "imageUrl", "linkUrl", "badgeText", "isActive")
     VALUES ($1,$2,$3,$4,$5, true)`,
    ["UzChess platformasiga xush kelibsiz", "Kurslar va kitoblar bilan shaxmatni chuqur o'rganing", "/banners/welcome.png", "/uz/courses", "Yangi"]
  );

  // Difficulty (shared by books + courses) — small UI badge icons, not a
  // dedicated Figma asset; a generic placeholder is fine here.
  const difficulties = [
    ["Boshlang'ich", "https://placehold.co/32x32?text=D"],
    ["O'rta", "https://placehold.co/32x32?text=D"],
    ["Professional", "https://placehold.co/32x32?text=D"],
  ];
  const difficultyIds = [];
  for (const [degree, icon] of difficulties) {
    const res = await client.query(
      `INSERT INTO difficulty (degree, icon) VALUES ($1,$2) RETURNING id`,
      [degree, icon]
    );
    difficultyIds.push(res.rows[0].id);
  }

  // Languages
  const languages = [
    ["O'zbek", "uz"],
    ["Rus", "ru"],
    ["Ingliz", "en"],
  ];
  const languageIds = [];
  for (const [title, code] of languages) {
    const res = await client.query(
      `INSERT INTO languages (title, code) VALUES ($1,$2) RETURNING id`,
      [title, code]
    );
    languageIds.push(res.rows[0].id);
  }

  // Authors (shared by books + courses)
  const authorNames = ["Garri Kasparov", "Bobby Fischer", "Magnus Karlsen"];
  const authorIds = [];
  for (const fullName of authorNames) {
    const res = await client.query(
      `INSERT INTO authors ("fullName") VALUES ($1) RETURNING id`,
      [fullName]
    );
    authorIds.push(res.rows[0].id);
  }

  // Course categories
  const courseCategories = ["Debyutlar", "Mittelshpil", "Endshpil"];
  const courseCategoryIds = [];
  for (const title of courseCategories) {
    const res = await client.query(
      `INSERT INTO "courseCategories" (title) VALUES ($1) RETURNING id`,
      [title]
    );
    courseCategoryIds.push(res.rows[0].id);
  }

  // Book categories (table: category)
  const bookCategories = ["Debyutlar nazariyasi", "Taktika", "Shaxmat tarixi"];
  const bookCategoryIds = [];
  for (const title of bookCategories) {
    const res = await client.query(
      `INSERT INTO category (title) VALUES ($1) RETURNING id`,
      [title]
    );
    bookCategoryIds.push(res.rows[0].id);
  }

  // Courses
  const courses = [
    ["Sitsiliya himoyasi asoslari", 150000, courseCategoryIds[0], difficultyIds[0], languageIds[0], "/covers/course-1.png"],
    ["Mittelshpilda strategiya", 200000, courseCategoryIds[1], difficultyIds[1], languageIds[0], "/covers/course-2.png"],
    ["Endshpil texnikasi", 180000, courseCategoryIds[2], difficultyIds[2], languageIds[0], "/covers/course-3.png"],
    ["Hind himoyasi", 160000, courseCategoryIds[0], difficultyIds[1], languageIds[1], "/covers/course-4.png"],
  ];
  const courseIds = [];
  for (const [title, price, categoryId, difficultyId, languageId, cover] of courses) {
    const res = await client.query(
      `INSERT INTO courses (title, price, cover, description, "categoryId","difficultyId","languageId")
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [title, price, cover, title + " haqida qisqacha ma'lumot.", categoryId, difficultyId, languageId]
    );
    courseIds.push(res.rows[0].id);
    await client.query(
      `INSERT INTO "courseAuthors" ("courseId","authorId") VALUES ($1,$2)`,
      [res.rows[0].id, authorIds[courseIds.length % authorIds.length]]
    );
  }

  // Books
  const books = [
    ["Shaxmat debyutlari", 80000, bookCategoryIds[0], difficultyIds[0], languageIds[0], 240, 2018, "/covers/book-1.png"],
    ["Taktik jumboqlar to'plami", 95000, bookCategoryIds[1], difficultyIds[1], languageIds[0], 300, 2020, "/covers/book-2.png"],
    ["Buyuk chempionlar", 120000, bookCategoryIds[2], difficultyIds[2], languageIds[0], 350, 2015, "/covers/book-3.png"],
    ["Endshpil sirlari", 90000, bookCategoryIds[1], difficultyIds[2], languageIds[1], 210, 2019, "/covers/book-4.png"],
  ];
  for (const [title, price, categoryId, difficultyId, languageId, pageCount, year, cover] of books) {
    const res = await client.query(
      `INSERT INTO books (title, price, cover, description, "pageCount","publishedYear","categoryId","difficultyId","languageId")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [title, price, cover, title + " haqida qisqacha ma'lumot.", pageCount, year, categoryId, difficultyId, languageId]
    );
    await client.query(
      `INSERT INTO "bookAuthors" ("bookId","authorId") VALUES ($1,$2)`,
      [res.rows[0].id, authorIds[res.rows[0].id % authorIds.length]]
    );
  }

  console.log("Seed complete.");
  await client.end();
}

main().catch(async (error) => {
  console.error(error);
  await client.end();
  process.exit(1);
});
