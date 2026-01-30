import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { SQLiteProvider, useSQLiteContext } from "../services/sqlite";

const mockExecuteSql = jest.fn();
const mockTransaction = jest.fn((fn) => {
  fn({ executeSql: mockExecuteSql });
});

jest.mock("expo-sqlite", () => ({
  openDatabase: jest.fn(() => ({ transaction: mockTransaction })),
}));

describe("sqlite context", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("useSQLiteContext throws outside provider", () => {
    const Thrower = () => {
      useSQLiteContext();
      return null;
    };

    expect(() => TestRenderer.create(<Thrower />)).toThrow(
      "useSQLiteContext must be used within SQLiteProvider"
    );
  });

  test("SQLiteProvider exposes runAsync and getAllAsync", async () => {
    let ctx;
    const Capture = () => {
      ctx = useSQLiteContext();
      return null;
    };

    mockExecuteSql.mockImplementationOnce((sql, params, onSuccess) => {
      onSuccess(null, { rows: { length: 1, item: () => ({ id: 1 }) } });
    });

    await act(async () => {
      TestRenderer.create(
        <SQLiteProvider>
          <Capture />
        </SQLiteProvider>
      );
    });

    await act(async () => {});

    expect(ctx).toBeTruthy();
    const result = await ctx.runAsync("select 1");
    expect(result.rows.length).toBe(1);

    mockExecuteSql.mockImplementationOnce((sql, params, onSuccess) => {
      onSuccess(null, {
        rows: {
          length: 2,
          item: (i) => ({ id: i + 1 }),
        },
      });
    });

    const rows = await ctx.getAllAsync("select *");
    expect(rows).toEqual([{ id: 1 }, { id: 2 }]);
  });
});
