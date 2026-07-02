import {
    Modal,
    Pressable,
    ScrollView,
    Text,
    View,
  } from "react-native";
  
  import { Ionicons } from "@expo/vector-icons";
  
  import { COLORS, globalStyles } from "@/styles/globalStyles";
  
  interface Props {
  
    visible:boolean;
  
    title:string;
  
    options:string[];
  
    value:string;
  
    onSelect:(value:string)=>void;
  
    onClose:()=>void;
  
  }
  
  export function BottomSheetSelect({
  
  visible,
  title,
  options,
  value,
  onSelect,
  onClose
  
  }:Props){
  
  return(
  
  <Modal
  visible={visible}
  transparent
  animationType="slide"
  >
  
  <Pressable
  
  style={{
  flex:1,
  justifyContent:"flex-end",
  backgroundColor:"rgba(0,0,0,.55)"
  }}
  
  onPress={onClose}
  
  >
  
  <Pressable
  onPress={(e)=>e.stopPropagation()}
  >
  
  <View
  style={globalStyles.addCard}
  >
  
  <View
  style={globalStyles.modalHeader}
  >
  
  <Text
  style={globalStyles.addTitle}
  >
  
  {title}
  
  </Text>
  
  <Pressable onPress={onClose}>
  
  <Ionicons
  name="close"
  size={28}
  color="#FFF"
  />
  
  </Pressable>
  
  </View>
  
  <View style={globalStyles.divider}/>
  
  <ScrollView>
  
  {
  
  options.map((item)=>(
  
  <Pressable
  
  key={item}
  
  style={{
  
  paddingVertical:18,
  
  borderBottomWidth:1,
  
  borderColor:COLORS.border
  
  }}
  
  onPress={()=>{
  
  onSelect(item);
  
  onClose();
  
  }}
  
  >
  
  <Text
  
  style={{
  
  fontSize:16,
  
  fontWeight:item===value?"700":"500",
  
  color:item===value
  ?COLORS.primary
  :COLORS.text
  
  }}
  
  >
  
  {item}
  
  </Text>
  
  </Pressable>
  
  ))
  
  }
  
  </ScrollView>
  
  </View>
  
  </Pressable>
  
  </Pressable>
  
  </Modal>
  
  )
  
  }