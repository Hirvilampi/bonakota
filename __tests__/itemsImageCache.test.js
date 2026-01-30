import { loadImageCache, saveImageCache } from "../services/itemsImageCache";
import AsyncStorage from "@react-native-async-storage/async-storage";

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe("itemsImageCache", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("loadImageCache returns empty object when userId missing", async () => {
    const result = await loadImageCache();
    expect(result).toEqual({});
    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
  });

  test("loadImageCache parses stored JSON", async () => {
    AsyncStorage.getItem.mockResolvedValueOnce("{\"a\":1}");
    const result = await loadImageCache("user-1");
    expect(result).toEqual({ a: 1 });
    expect(AsyncStorage.getItem).toHaveBeenCalledWith("@items_image_cache_user-1");
  });

  test("loadImageCache handles storage errors", async () => {
    AsyncStorage.getItem.mockRejectedValueOnce(new Error("boom"));
    const result = await loadImageCache("user-1");
    expect(result).toEqual({});
  });

  test("saveImageCache stores JSON", async () => {
    await saveImageCache("user-2", { x: 2 });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      "@items_image_cache_user-2",
      JSON.stringify({ x: 2 })
    );
  });

  test("saveImageCache ignores missing userId", async () => {
    await saveImageCache();
    expect(AsyncStorage.setItem).not.toHaveBeenCalled();
  });
});
