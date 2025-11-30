import React, { useState } from "react";
import { View } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";

export default function LocationPicker({ locations, location, setLocation, minheight }) {
    const [open, setOpen] = useState(false);

    return (
        <View style={{ zIndex: 1000, width: "100%", marginVertical: 10 }}>

            <DropDownPicker
                open={open}
                value={null}
                items={locations}
                setOpen={setOpen}
                setValue={callback => setLocation(callback(location))}
                setItems={() => { }}
                style={{
                    backgroundColor: "#EAF2EC",
                    borderColor: "#52946B",
                    borderWidth: 1,
                    borderRadius: 8,
                    minHeight: minheight,
                    width: "20%",
                }}
                dropDownContainerStyle={{
                    backgroundColor: "#F8FBFA",
                    borderColor: "#52946B",
                    borderWidth: 1,
                    borderRadius: 8,
                    width: "70%",
                    left: "-50%",
                }}
                placeholder=""
                showArrowIcon={true}
    
                labelProps={{ numberOfLines: 0 }}
                arrowIconStyle={{
                    tintColor: '#333',
                    width: 18,
                    height: 18,
                }}
                listMode="SCROLLVIEW"
                scrollViewProps={{ nestedScrollEnabled: true }}

            />

        </View>
    );
}