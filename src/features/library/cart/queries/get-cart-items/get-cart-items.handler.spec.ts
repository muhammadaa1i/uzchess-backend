import { GetCartItemsHandler } from "@/features/library/cart/queries/get-cart-items/get-cart-items.handler";
import { GetCartItemsQuery } from "@/features/library/cart/queries/get-cart-items/get-cart-items.query";
import { CartItem } from "@/features/library/entities/cart/cart-item.entity";
import { Book } from "@/features/library/entities/book/book.entity";
import { Rating } from "@/features/library/entities/rating/rating.entity";

describe("GetCartItemsHandler", () => {
  let handler: GetCartItemsHandler;

  beforeEach(() => {
    handler = new GetCartItemsHandler();
  });

  afterEach(() => jest.restoreAllMocks());

  it("maps books, quantity and rating stats correctly", async () => {
    jest.spyOn(CartItem, "findBy").mockResolvedValue([
      { bookId: 1, userId: 9, quantity: 3 },
      { bookId: 2, userId: 9, quantity: 1 },
    ] as any);

    jest.spyOn(Book, "find").mockResolvedValue([
      {
        id: 1,
        title: "Book One",
        price: 100,
        discountPrice: null,
        cover: "cover1.png",
        description: "desc1",
        pageCount: 100,
        publishedYear: 2020,
        categoryId: 1,
        difficultyId: 1,
        languageId: 1,
        bookAuthors: [{ authorId: 11 }, { authorId: 12 }],
      },
      {
        id: 2,
        title: "Book Two",
        price: 50,
        discountPrice: 40,
        cover: "cover2.png",
        description: "desc2",
        pageCount: 50,
        publishedYear: 2021,
        categoryId: 2,
        difficultyId: 2,
        languageId: 2,
        bookAuthors: [],
      },
    ] as any);

    const getRawManyMock = jest.fn().mockResolvedValue([
      { bookId: 1, average: "4.5", count: "2" },
    ]);
    const queryBuilder: any = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: getRawManyMock,
    };
    jest.spyOn(Rating, "createQueryBuilder").mockReturnValue(queryBuilder);

    const result = await handler.execute(new GetCartItemsQuery(9));

    expect(result).toHaveLength(2);

    const book1 = result.find((b: any) => b.id === 1)!;
    expect(book1.quantity).toBe(3);
    expect(book1.authorIds).toEqual([11, 12]);
    expect(book1.averageRating).toBe(4.5);
    expect(book1.ratingsCount).toBe(2);

    const book2 = result.find((b: any) => b.id === 2)!;
    expect(book2.quantity).toBe(1);
    expect(book2.authorIds).toEqual([]);
    expect(book2.averageRating).toBe(0);
    expect(book2.ratingsCount).toBe(0);
  });

  it("returns an empty array when the cart is empty, without querying books or ratings", async () => {
    jest.spyOn(CartItem, "findBy").mockResolvedValue([]);
    const bookFindSpy = jest.spyOn(Book, "find");
    const ratingSpy = jest.spyOn(Rating, "createQueryBuilder");

    const result = await handler.execute(new GetCartItemsQuery(9));

    expect(result).toEqual([]);
    expect(bookFindSpy).not.toHaveBeenCalled();
    expect(ratingSpy).not.toHaveBeenCalled();
  });
});
