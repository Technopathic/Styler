// @flow

import React from 'react'
import { ScrollView, AsyncStorage, View, Image, Switch, Dimensions, TouchableOpacity } from 'react-native'
import { Actions as NavigationActions } from 'react-native-router-flux'

import { Container, Header, Content, List, ListItem, Text, Button, Right, Left, Body, Toast, Spinner } from 'native-base'
import Icon from 'react-native-vector-icons/MaterialIcons';

// Styles
import Styles from './Styles/ProfileStyle'

class Settings extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
     user: "",
     token: "",
     notiVote:null,
     notiReply:null,
     notiBounce:null,
     notiMention:null,
     profPrivate:null,
     isLoading:true,
     showToast:false
   };
 };

 showToast = (text) => {
   Toast.show({
    text: text,
    position: 'bottom',
    buttonText:'OK',
    duration:3000
   });
 };

 async componentWillMount() {
   await AsyncStorage.multiGet(["token", "user"], (err, stores) => {
    stores.map((result, i, store) => {
      this.setState({
        token: store[0][1],
        user: JSON.parse(store[1][1])
      });
    });
  })
  .then(() => {
     this.getSettings();
   })
 };

  getSettings = () => {
    fetch('http://bragger.technopathic.me/api/getSettings/?token='+this.state.token, {
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    })
    .then(function(response) {
     return response.json()
    })
    .catch((error) => console.warn("fetch error:", error))
    .then(function(json) {
     if(json.error === "token_not_provided")
     {
        //NavigationActions.signin();
     }
     else {
       this.setState({
         notiVote:json.notiVote,
         notiReply:json.notiReply,
         notiBounce:json.notiReply,
         notiMention:json.notiMention,
         profPrivate:json.profPrivate,
         isLoading:false
       })
     }
    }.bind(this))
  };

  updateSettings = () => {
    var _this = this;

    var data = new FormData();
    data.append('notiVote', this.state.notiVote);
    data.append('notiReply', this.state.notiReply);
    data.append('notiBounce', this.state.notiBounce);
    data.append('notiMention', this.state.notiMention);
    data.append('profPrivate', this.state.profPrivate);

    fetch('http://bragger.technopathic.me/api/updateSettings/?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      },
      body:data
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast(json.error);
      }
      else if(json.success) {
        _this.setState({
          disableSubmit:true
        })
        _this.showToast('Profile Updated.');
        setTimeout(function(){NavigationActions.root()}, 2000);
      }
    }.bind(this));
  };

  signOut = () => {
    AsyncStorage.removeItem("token");
    AsyncStorage.removeItem("user");
    this.showToast('Good-Bye!.');
    NavigationActions.signin();
  };


  render () {

    const profileHead = {
      flex:1,
      flexDirection:'row',
      marginLeft:15,
      marginRight:15,
      marginTop:15,
      paddingBottom:15,
      borderBottomWidth:1,
      borderBottomColor:'#CCCCCC'
    };

    const profileRight = {
      flex:1,
      flexDirection:'column',
      justifyContent:'center',
    };

    const profileStats = {

    };

    const profileFollow = {
      flex:1,
      flexDirection:'row'
    };

    const followBox = {
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
    };

    const statNum = {
      color:'#333333',
      fontWeight:'bold',
      fontSize:20,
    };

    const statTitle = {
      color:'#444444',
      fontSize:10,
    };

    const profileButtons = {
      flex:1,
      flexDirection:'row',
      justifyContent:'center',
    };

    const avatarStyle = {
      height:100,
      width:100,
      borderRadius:5,
    };

    const textStyle = {
      fontSize:14,
      color:'#333333',
      marginTop:-3
    };

    const descBody = {
      fontSize:14,
      color:'#666666',
      marginTop:-3
    };

    const appBar = {
      backgroundColor:"#263238",
      flex:1,
      justifyContent:'center',
      alignItems:'center',
      height:40,
      borderBottomWidth:1,
      borderBottomColor:'#DF3D82'
    };

    const titleStyle = {
      textAlign:"center",
      fontSize:28,
      color:"#EEEEEE",
      maxWidth:200,
      fontFamily:"Lobster-Regular"
    };

    const inputRow = {
      flex:1,
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',
      borderBottomWidth:1,
      borderBottomColor:'#EEEEEE',
      paddingBottom:10
    };

    const inputRowTwo = {
      flex:1,
      flexDirection:'row',
      alignItems:'center',
      justifyContent:'space-between',
      borderBottomWidth:1,
      borderBottomColor:'#EEEEEE',
      paddingTop:10,
      paddingBottom:10
    };

    const settingTitle = {
      fontSize:16,
      color:'#444444',
      fontFamily:'Lato-Regular'
    };

    const spinnerStyle = {
      flex:1,
      height:Dimensions.get('window').height,
      justifyContent:'center',
      alignItems:'center'
    };

    if (this.state.isLoading) {
      return (
        <View style={spinnerStyle}>
          <Spinner color="#DF3D82"/>
        </View>
      )
    }
    else {
      return (
        <ScrollView>
          <Header style={appBar}>
            <Left>
              <Button transparent onPress={() => NavigationActions.pop()}>
                <Icon name='chevron-left' size={35} style={{color:'#EEEEEE'}} />
              </Button>
            </Left>
            <Body>
              <Text style={titleStyle}>Settings</Text>
            </Body>
          </Header>
          <Content style={{padding:10}}>
            <View style={inputRow}>
              <Text style={settingTitle}>Show Notifcations on Votes</Text>
              <Switch onValueChange={(value) => this.setState({notiVote: value}).then(() => { this.updateSettings(); })} value={this.state.notiVote} />
            </View>
            <View style={inputRowTwo}>
              <Text style={settingTitle}>Show Notifcations on Replies</Text>
              <Switch onValueChange={(value) => this.setState({notiReply: value}).then(() => { this.updateSettings(); })} value={this.state.notiReply} />
            </View>
            <View style={inputRowTwo}>
              <Text style={settingTitle}>Show Notifcations on Mentions</Text>
              <Switch onValueChange={(value) => this.setState({notiMention: value}).then(() => { this.updateSettings(); })} value={this.state.notiMention} />
            </View>
            <View style={inputRowTwo}>
              <Text style={settingTitle}>Private Profile</Text>
              <Switch onValueChange={(value) => this.setState({profPrivate: value}).then(() => { this.updateSettings(); })} value={this.state.profPrivate} />
            </View>
            <View style={inputRowTwo}>
              <Text> </Text>
            </View>
            <View style={inputRowTwo}>
              <Text style={settingTitle}>Blog</Text>
            </View>
            <View style={inputRowTwo}>
              <Text style={settingTitle}>Privacy Policy</Text>
            </View>
            <View style={inputRowTwo}>
              <Text style={settingTitle}>Terms of Service</Text>
            </View>
            <TouchableOpacity style={inputRowTwo} onPress={() => this.signOut()}>
              <Text style={settingTitle}>Log Out</Text>
            </TouchableOpacity>
          </Content>
        </ScrollView>
      )
    }
  }
}

const mapStateToProps = (state) => {
  return {
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
  }
}

export default Settings
