import { useState } from "react";


// if you submit initialOwnerId that will be the owner id. Otherwise it will be null
export function useItemData(initialOwnerId = null) {
    const [itemData, setItemData] = useState({
        itemName: "",
        description: "",
        uri: null,
        size: "",
        user: "",
        location: "",
        group_name: "",
        category_name: "",
        value: null,
        price: 0.0,
        on_market_place: 0,
        deleted: 0,
        owner_id: initialOwnerId,
        timestamp: null,
        new_owner: "",
        old_owner: "",
        receipt_image: null,
    });

    // used for saving item data olioon
    const updateItemData = (updates) => {
        setItemData((prev) => ({ ...prev, ...updates }));
    }

   // used for clearing item data from olio
    const clearItemData = () => {
        setItemData({
            itemName: "",
            selectedCategory_id: 0,
            location: "",
            description: "",
            uri: null,
            size: "",
            visible: false,
            selectedSize: "Medium",
            group_id: 1,
            categoriesFront: [],
            uploading: false,
            open: false,
            value: null,
            loading: false,
            price: 0.0,
            on_market_place: 0,
            deleted: 0,
            owner_id,
            timestamp: null,
            items: [],
        });
    };

return { itemData, updateItemData, clearItemData };
}
