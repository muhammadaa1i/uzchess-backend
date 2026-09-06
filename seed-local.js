// One-off local dev seed script — run with `node seed-local.js` from the backend
// repo root. Populates the local Postgres DB with sample rows so the frontend
// has something to render in development. Not part of the app; safe to delete.
const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://postgres:001007@localhost:5432/uzchess",
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
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      "https://pub-83d44d477896463e9c27188da6d489de.r2.dev/bookCovers/1785305830826-503.png",
      2400,
      "rapid",
      playerIds[0],
      playerIds[1],
    ]
  );

  // News
  const newsItems = [
    ["UzChess milliy chempionati boshlandi", "Toshkentda yillik milliy shaxmat chempionati start oldi."],
    ["Yosh shaxmatchilar uchun yangi kurs ochildi", "Boshlang'ich va o'rta daraja uchun mo'ljallangan yangi video kurslar platformaga qo'shildi."],
    ["UzChess reytingi yangilandi", "FIDE reytinglari asosida milliy reyting jadvali yangilandi."],
  ];
  for (const [title, excerpt] of newsItems) {
    await client.query(
      `INSERT INTO news (title, excerpt, content, "imageUrl", "publishedAt", "viewsCount")
       VALUES ($1,$2,$3,$4, now(), $5)`,
      [title, excerpt, excerpt + " " + excerpt, "https://pub-83d44d477896463e9c27188da6d489de.r2.dev/bookCovers/1785305830826-503.png", Math.floor(Math.random() * 500)]
    );
  }

  // Banners
  await client.query(
    `INSERT INTO banners (title, subtitle, "imageUrl", "linkUrl", "badgeText", "isActive")
     VALUES ($1,$2,$3,$4,$5, true)`,
    ["UzChess platformasiga xush kelibsiz", "Kurslar va kitoblar bilan shaxmatni chuqur o'rganing", "https://pub-83d44d477896463e9c27188da6d489de.r2.dev/bookCovers/1785305830826-503.png", "/uz/courses", "Yangi"]
  );

  // Difficulty (shared by books + courses)
  const difficulties = ["Boshlang'ich", "O'rta", "Professional"];
  const difficultyIds = [];
  for (const degree of difficulties) {
    const res = await client.query(
      `INSERT INTO difficulty (degree, icon) VALUES ($1,$2) RETURNING id`,
      [degree, "https://pub-83d44d477896463e9c27188da6d489de.r2.dev/bookCovers/1785305830826-503.png"]
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
    ["Sitsiliya himoyasi asoslari", 150000, courseCategoryIds[0], difficultyIds[0], languageIds[0]],
    ["Mittelshpilda strategiya", 200000, courseCategoryIds[1], difficultyIds[1], languageIds[0]],
    ["Endshpil texnikasi", 180000, courseCategoryIds[2], difficultyIds[2], languageIds[0]],
    ["Hind himoyasi", 160000, courseCategoryIds[0], difficultyIds[1], languageIds[1]],
  ];
  const courseIds = [];
  for (const [title, price, categoryId, difficultyId, languageId] of courses) {
    const res = await client.query(
      `INSERT INTO courses (title, price, cover, description, "categoryId","difficultyId","languageId")
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [title, price, "https://pub-83d44d477896463e9c27188da6d489de.r2.dev/bookCovers/1785305830826-503.png", title + " haqida qisqacha ma'lumot.", categoryId, difficultyId, languageId]
    );
    courseIds.push(res.rows[0].id);
    await client.query(
      `INSERT INTO "courseAuthors" ("courseId","authorId") VALUES ($1,$2)`,
      [res.rows[0].id, authorIds[courseIds.length % authorIds.length]]
    );
  }

  // Books
  const books = [
    ["Shaxmat debyutlari", 80000, bookCategoryIds[0], difficultyIds[0], languageIds[0], 240, 2018],
    ["Taktik jumboqlar to'plami", 95000, bookCategoryIds[1], difficultyIds[1], languageIds[0], 300, 2020],
    ["Buyuk chempionlar", 120000, bookCategoryIds[2], difficultyIds[2], languageIds[0], 350, 2015],
    ["Endshpil sirlari", 90000, bookCategoryIds[1], difficultyIds[2], languageIds[1], 210, 2019],
  ];
  for (const [title, price, categoryId, difficultyId, languageId, pageCount, year] of books) {
    const res = await client.query(
      `INSERT INTO books (title, price, cover, description, "pageCount","publishedYear","categoryId","difficultyId","languageId")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [title, price, "https://pub-83d44d477896463e9c27188da6d489de.r2.dev/bookCovers/1785305830826-503.png", title + " haqida qisqacha ma'lumot.", pageCount, year, categoryId, difficultyId, languageId]
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
