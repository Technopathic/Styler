// @flow

import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding:15
  },
  smallText: {
    fontSize:11
  },
  topicOptions: {
    flex:1,
    flexDirection:'row',
    justifyContent:'space-between'
  },
  uploadButton: {
    paddingTop:1,
    paddingBottom:1,
    paddingLeft:15,
    paddingRight:15,
    backgroundColor:'#BBBBBB'
  },
  iconStyle: {
    color:'#666666',
    fontSize:22
  },
  inputStyle: {
    marginTop:15
  },
  chipStyle: {
    flex:1,
    flexDirection:'row'
  },
  singleChip: {
    backgroundColor:'#CCCCCC',
    borderRadius:25,
    paddingTop:2,
    paddingBottom:2,
    paddingLeft:10,
    paddingRight:10,
    margin:3
  },
  tagIcon: {
    fontSize:16,
    marginTop:3,
  },
  autoInputStyle: {
    backgroundColor:'transparent',
    borderWidth:0,
    margin:0,
    marginBottom:0
  },
  autoStyle: {
    paddingLeft:10,
    paddingRight:10,
    paddingTop:3,
    paddingBottom:3,
    margin:0
  },
  buttonStyleOne: {
    margin:15,
    elevation:0,
    backgroundColor:'#02BB75'
  },
  autocompleteContainerOne: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: -200,
    zIndex: 1
  },
  autocompleteContainerTwo: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: -400,
    zIndex: 1
  },
})
