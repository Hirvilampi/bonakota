import { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useCategories } from "../context/CategoryContext"; 

export default function CategoryPicker({ category_id, onChangeCategory, setCategory_id }) {
    const { categories, loading } = useCategories(); // käytetty context

    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(category_id || null);
    const [items, setItems] = useState([]);

    // Päivitä value jos parent vaihtaa category_id:n
    useEffect(() => {
        setValue(category_id || null);
    }, [category_id]);

    // Muuta categories → dropdown-muotoon
    useEffect(() => {
        if (!categories) return;

        const arr = Object.entries(categories).map(([key, obj]) => ({
            label: obj.name,
            value: key     
        }));
console.log('-- KATEGORIAT --',arr);
        setItems(arr);
    }, [categories]);

    if (loading || !categories) {
        return <ActivityIndicator size="small" color="#52946B" />;
    }

   // setCategory_id(newVal); // päivitä parentille

    return (
        <View style={{ zIndex: 1000, width: "100%", marginVertical: 10 }}>
            <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={(callback) => {
                    const newVal = callback(value);
                    setValue(newVal);
                    const selected = items.find(i => i.value === newVal);
                    onChangeCategory?.({ id:newVal, name: selected?.label ?? ""}); // parenttiin päivittyy niin id, kuin nimi
                
                }}
                placeholder="Choose category"
                listMode="SCROLLVIEW"
                style={{
                    backgroundColor: "#EAF2EC",
                    borderColor: "#52946B",
                    borderWidth: 0,
                    borderRadius: 8,
                    minHeight: 45,
                }}
                dropDownContainerStyle={{
                    backgroundColor: "#F8FBFA",
                    borderColor: "#52946B",
                    borderWidth: 1,
                    borderRadius: 8,
                }}
                textStyle={{
                    fontSize: 16,
                    color: "#52946B",
                }}
            />
        </View>
    );
}