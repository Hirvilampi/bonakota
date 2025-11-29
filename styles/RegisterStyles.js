import { StyleSheet } from "react-native";
// our styles for the project


export const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        paddingBottom: 120,
        backgroundColor: "#F8FBFA",
    },
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 10,
        backgroundColor: "#F8FBFA",
    },
    inputView: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
        marginBottom: 20,
    },
    section: {
        alignSelf: "stretch",
        marginLeft: 20,
        marginBottom: 10,
        marginTop: 5,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#52946B",
        marginBottom: 10,
    },
    input: {
        height: 40,
        backgroundColor: "#EAF2EC",
        borderWidth: 0,
        paddingHorizontal: 10,
        color: "#52946B",
        width: "90%",
        borderRadius: 5,
        margin: 10,
    },
    showimage: {
        width: 100,
        height: 100,
        borderRadius: 5,
        marginRight: 10,
    },
    cameraimage: {
        width: 250,
        height: 250,
        borderRadius: 5,
        marginRight: 10,
    },
    itemboxrow: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 8,
    },
    itembox: {
        alignItems: "center",
        marginRight: 8,
    },
    itemTitle: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#0D1A12",
    },
    itemCategory: {
        fontSize: 13,
        color: "#52946B",
        marginLeft: 0,
    },
    categoryButton: {
        height: 40,
        borderRadius: 8,
        marginRight: 6,
    },
    categoryContent: {
        height: 40,
        paddingVertical: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    categoryContentWide: {
        height: 40,
        width: "100%",
        paddingVertical: 0,
        alignItems: "center",
        justifyContent: "center",
    },
    categoryLabel: {
        fontSize: 14,
        lineHeight: 18,
    },
    inputdescription: {
        height: 120,
        backgroundColor: '#EAF2EC',
        borderWidth: 0,
        paddingHorizontal: 10,
        color: '#52946B', // Text color
        width: '90%',
        alignItems: 'center',
        justifyContent: 'space-around',
        margin: 10,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        textAlignVertical: 'top',
    },
    cameraviewadditem: {
        backgroundColor: '#F8FBFA',
        borderWidth: 1,
        borderStyle: 'dashed',
        width: '60%',
        height: '35%',
        color: '#0D1A12',
        borderColor: '#52946B',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    scrollContaineradditem: {
        flexGrow: 1,
        justifyContent: 'flex-start',
        paddingHorizontal: 12,
        paddingBottom: 250,
        backgroundColor: '#F8FBFA',
    },
    loginregisterbutton: {
        backgroundColor: '#EAF2EC',
        color: '#0D1A12',
        fontWeight: 'bold',
        padding: 12,
        margin: 7,
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
    },
    camerabutton: {
        backgroundColor: '#EAF2EC',
        color: '#0D1A12',
        fontWeight: 'bold',
    },
    camerabuttontext: {
        backgroundColor: '#EAF2EC',
        color: '#0D1A12',
        fontWeight: 'bold',
        padding: 10,
        margin: 0,

    },
    gridContainer: {
        padding: 10,
        justifyContent: 'center',
    },

});

export default styles;
