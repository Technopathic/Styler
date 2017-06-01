// @flow

import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  profileHead: {
    flex:1,
    flexDirection:'row',
    marginLeft:15,
    marginRight:15,
    marginTop:15,
    paddingBottom:15,
    borderBottomWidth:1,
    borderBottomColor:'#CCCCCC'
  },
  profileRight: {
    flex:1,
    flexDirection:'column',
    justifyContent:'center',
  },
  profileStats: {

  },
  profileFollow: {
    flex:1,
    flexDirection:'row'
  },
  followBox: {
    flex:1,
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    paddingLeft:5,
    paddingRight:5,
    marginTop:5,
    marginLeft:10,
    marginRight:10,
    borderRadius:3,
  },
  statNum: {
    color:'#333333',
    fontWeight:'bold',
    fontSize:15,
  },
  statTitle: {
    color:'#444444',
    fontSize:10,
    marginTop:-10
  },
  profileButtons: {
    flex:1,
    flexDirection:'row',
    justifyContent:'center',
  },
  avatarStyle: {
    height:100,
    width:100,
    borderRadius:5,
  },
  textStyle: {
    fontSize:14,
    color:'#333333',
    marginTop:-3
  },
  descBody: {
    fontSize:14,
    color:'#666666',
    marginTop:-3
  },
  followButton: {
    flex:1,
    borderWidth:1,
    borderColor:'#CCCCCC',
    margin:10,
    backgroundColor:'#BBBBBB',
    elevation:0
  },
  activeButton: {
    flex:1,
    borderWidth:1,
    borderColor:'#DDDDDD',
    margin:10,
    backgroundColor:'#02BB75',
    elevation:0
  },
})
