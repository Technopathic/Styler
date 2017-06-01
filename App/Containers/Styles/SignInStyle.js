// @flow

import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  backgroundContainer: {
    flex:1,
    resizeMode: 'cover',
    width:null,
    height:null,
    paddingTop:15,
    paddingBottom:15
  },
  logoContainer: {
    resizeMode: 'cover',
    width:150,
    height:150,
    alignSelf:'center',
  },
  titleContainer: {
    alignSelf:'center',
    color:'#222222',
    fontSize:24,
    marginBottom:15
  },
  inputContainer: {
    backgroundColor:'rgba(0, 0, 0, 0.3)',
    padding:15,
    borderTopWidth:1,
    borderTopColor:'#888888',
    borderBottomWidth:1,
    borderBottomColor:'#888888'
  },
  inputStyle: {
    color:'#EEEEEE'
  },
  iconStyle: {
    color:'#CCCCCC'
  },
  buttonStyleOne: {
    margin:15,
    elevation:0,
    backgroundColor:'#02BB75'
  },
  buttonStyleTwo: {
    marginLeft:30,
    marginRight:30,
    elevation:0,
    backgroundColor:'#CCCCCC'
  },
  textStyleTwo: {
    color:'#222222'
  },
  facebookButton: {
    backgroundColor:'#3b5998',
    marginTop:10,
    marginLeft:15,
    marginRight:15,
    elevation:0
  },
  twitterButton: {
    backgroundColor:'#1dcaff',
    marginTop:10,
    marginLeft:15,
    marginRight:15,
    elevation:0
  },
  googleButton: {
    backgroundColor:'#EA4335',
    marginTop:10,
    marginLeft:15,
    marginRight:15,
    elevation:0
  },
  resetText: {
    marginTop:15,
    alignSelf:'center',
    color:'#CCCCCC',
    fontSize:11
  }

})
