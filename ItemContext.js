import { createContext, useCallback, useContext, useReducer, useMemo, useEffect } from "react";
import { baseURL } from "./services/config";


// Contexts
const DataContext = createContext();
const ActionsContext = createContext();


const initialState = {
  items: [],
  categories: [],
};

// Reducer
function reducer(state, action) {
  switch (action.type) {
    case "add":
      return { ...state, items: [action.item, ...state.items] };
    case "update":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.item.id ? { ...i, ...action.item } : i
        ),
      };
    case "remove":
      return {
        ...state,
        items: state.items.filter((i) => i.id !== action.id),
      };
    case "storeCategories":
      return {
        ...state,
        categories: action.payload,
      };
    default:
      return state;
  }
}


// Provider-component
export function ItemsProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Toiminnot
  const addItem = useCallback((item) => dispatch({ type: "add", item }), []);
  const updateItem = useCallback((item) => dispatch({ type: "update", item }), []);
  const removeItem = useCallback((item) => dispatch({ type: "remove", item }), []);

  const storeCategories = useCallback(
    (categories) => dispatch({ type: "storeCategories", payload: categories }),
    []
  );


  // Get categories 
  useEffect(() => {
    (async () => {
      try {
        console.log("🔄 Loading categories...");
        const res = await fetch(`${baseURL}/categories/`, {
          method: "GET",
          headers: { accept: "application/json" },
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          throw new Error(`Load failed ${res.status}: ${txt}`);
        }

        const data = await res.json();
        const catdata = data.map((cat) => ({
          label: cat.name,
          value: String(cat.id),
          key: `cat-${cat.id}`,
        }));

        storeCategories(catdata);
        console.log(`✅ Categories loaded (${catdata.length})`);
      } catch (error) {
        console.error("❌ Could not load categories", error);
      }
    })();
  }, [storeCategories]);

  // --------------------------
  // Context-arvot
  // --------------------------
  const data = useMemo(() => state, [state]);
  const actions = useMemo(
    () => ({ addItem, updateItem, removeItem, storeCategories }),
    [addItem, updateItem, removeItem, storeCategories]
  );

  return (
    <DataContext.Provider value={data}>
      <ActionsContext.Provider value={actions}>{children}</ActionsContext.Provider>
    </DataContext.Provider>
  );
}

// --------------------------
// Hookit
// --------------------------
export const useItemsData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useItemsData must be used inside ItemsProvider");
  return ctx;
};

export const useItemsActions = () => {
  const ctx = useContext(ActionsContext);
  if (!ctx) throw new Error("useItemsActions must be used inside ItemsProvider");
  return ctx;
};