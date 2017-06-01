// @flow

import React from 'react'
import { View, ScrollView, Text, Image, Modal, AsyncStorage } from 'react-native'
import { Actions as NavigationActions } from 'react-native-router-flux'

import { Container, Content, Header, InputGroup, Input, List, ListItem, Button, Icon, Toast } from 'native-base';
import MyCon from 'react-native-vector-icons/MaterialCommunityIcons';

import { google, facebook, twitter } from 'react-native-simple-auth';

// Styles
import styles from './Styles/SignInStyle'

class SignIn extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
     email:"",
     password:"",
     disableSubmit:false,
     forgotOpen: false,
     reset:"",
     resetModal: false,
     showToast: false
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

  signIn() {
    var _this = this;
    fetch('http://styler.technopathic.me/api/signIn', {
      method: 'POST',
      body: JSON.stringify({
        email: this.state.email,
        password: this.state.password
      })
    }).then(function(response) {
      return response.json()
    })
    .then(function(json) {
      if(json == 2) {
        _this.showToast('Wrong E-mail.');
      }
      else if(json == 0) {
        _this.showToast('Looks like you were banned.');
      }
      else if(json.error) {
        _this.showToast('Wrong Password.');
      }
      else if(json.token) {
        AsyncStorage.setItem('token', json.token);
        fetch('http://styler.technopathic.me/api/authenticate/user?token='+ json.token, {
          headers:{
            'Authorization': 'Bearer ' + json.token
          }
        })
        .then(function(userResponse) {
          return userResponse.json()
        })
        .then(function(userJson) {
          _this.setState({disableSubmit:true});
          AsyncStorage.setItem('user', JSON.stringify(userJson.user));
          _this.showToast('Hey there, '+userJson.profile.profileName+"!");
          setTimeout(function(){NavigationActions.root()}, 3000);
        })
      }
    })
  };

  resetPassword() {
    var _this = this;
    fetch('http://styler.technopathic.me/api/resetPassword', {
      method: 'POST',
      body: JSON.stringify({
        email: this.state.reset
      })
    }).then(function(response) {
      return response.json()
    })
    .then(function(json) {
      if(json === 1) {
        _this.showReset(!this.state.resetModal);
        _this.showToast('A reset E-mail has been sent to you');
      }
      else if(json === 2)
      {
        _this.showToast('E-mail not found.');
      }
    })
  };

  handleEmail = (event) => this.setState({email: event.nativeEvent.text});
  handlePassword = (event) => this.setState({password: event.nativeEvent.text});
  handleReset = (event) => this.setState({reset: event.nativeEvent.text});

  showReset(visible) { this.setState({resetModal: visible}); }

  facebookSignIn = () => {
    var _this = this;
    facebook({
      appId: '1327709913915742',
      callback:'fb1327709913915742://authorize'
    }).then((info) => {
      fetch('http://styler.technopathic.me/api/socialSignOn', {
        method: 'POST',
        body: JSON.stringify({
          token: info.credentials.access_token,
          provider:'Facebook'
        })
      }).then(function(response) {
        return response.json()
      })
      .then(function(json) {
        if(json.error) {
          _this.showToast(json.error);
        }
        else if(json.token) {
          AsyncStorage.setItem('token', json.token);
          fetch('http://styler.technopathic.me/api/authenticate/user?token='+ json.token, {
            headers: {
              "Authorization":"Bearer "+json.token
            }
          })
          .then(function(userResponse) {
            return userResponse.json();
          })
          .then(function(userJson) {
            _this.setState({disableSubmit:true});
            AsyncStorage.setItem('user', JSON.stringify(userJson.user));
            _this.showToast('Hey there, '+userJson.profile.profileName+"!");
            setTimeout(function(){NavigationActions.root()}, 3000);
          })
        }
      })
    }).catch((error) => {
      // error.code
      // error.description
    });
  };

  twitterSignIn = () => {
    var _this = this;
    twitter({
      appId: 'v9ZuzZASJZ6W5AdtGBf6KuDtY',
      appSecret: 'jlBiEuMjqggShJwG7BztRZHSREp0RrQRPn1fTQQTzXX8FZgxDS',
      callback: 'com.renplatev3://authorize',
    }).then((info) => {
      fetch('http://styler.technopathic.me/api/socialSignOn', {
        method: 'POST',
        body: JSON.stringify({
          token: info.credentials.oauth_token,
          secret:info.credentials.oauth_token_secret,
          provider:'Twitter'
        })
      }).then(function(response) {
        return response.json()
      })
      .then(function(json) {
        if(json.error) {
          _this.showToast(json.error);
        }
        else if(json.token) {
          AsyncStorage.setItem('token', json.token);
          fetch('http://styler.technopathic.me/api/authenticate/user?token='+ json.token, {
            headers: {
              "Authorization":"Bearer "+json.token
            }
          })
          .then(function(userResponse) {
            return userResponse.json();
          })
          .then(function(userJson) {
            _this.setState({disableSubmit:true});
            AsyncStorage.setItem('user', JSON.stringify(userJson.user));
            _this.showToast('Hey there, '+userJson.profile.profileName+"!");
            setTimeout(function(){NavigationActions.root()}, 3000);
          })
        }
      })
    }).catch((error) => {
      // error.code
      // error.description
    });
  };

  googleSignIn = () => {
    var _this = this;
    google({
      appId: '85643794193-tf4jmni7bqirqqvm3fio8l0qgc5idmrh.apps.googleusercontent.com',
      callback: 'com.renplatev3:/oauth2redirect',
    }).then((info) => {
      fetch('http://styler.technopathic.me/api/socialSignOn', {
        method: 'POST',
        body: JSON.stringify({
          token: info.credentials.access_token,
          provider:'Google'
        })
      }).then(function(response) {
        return response.json()
      })
      .then(function(json) {
        if(json.error) {
          _this.showToast(json.error);
        }
        else if(json.token) {
          AsyncStorage.setItem('token', json.token);
          fetch('http://styler.technopathic.me/api/authenticate/user?token='+ json.token, {
            headers: {
              "Authorization":"Bearer "+json.token
            }
          })
          .then(function(userResponse) {
            return userResponse.json();
          })
          .then(function(userJson) {
            _this.setState({disableSubmit:true});
            AsyncStorage.setItem('user', JSON.stringify(userJson.user));
            _this.showToast('Hey there, '+userJson.profile.profileName+"!");
            setTimeout(function(){NavigationActions.root()}, 3000);
          })
        }
      })
    }).catch((error) => {
      // error.code
      // error.description
    });
  };

  render () {

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
      fontFamily:"Lobster-Regular"
    };

    const backgroundContainer = {
      flex:1,
      resizeMode: 'cover',
      width:null,
      height:null,
      paddingTop:15,
      paddingBottom:15,
      backgroundColor:'#444444'
    };

    const logoContainer = {
      resizeMode: 'cover',
      width:150,
      height:150,
      alignSelf:'center',
    };

    const titleContainer = {
      alignSelf:'center',
      color:'#FFFFFF',
      fontSize:32,
      marginBottom:15,
      fontFamily:'Lobster-Regular'
    };

    const inputContainer = {
      backgroundColor:'rgba(0, 0, 0, 0.3)',
      padding:15,
      borderTopWidth:1,
      borderTopColor:'#888888',
      borderBottomWidth:1,
      borderBottomColor:'#888888'
    };

    const inputStyle = {
      color:'#EEEEEE'
    };

    const iconStyle = {
      color:'#FFFFFF'
    };

    const buttonStyleOne = {
      margin:15,
      elevation:0,
      backgroundColor:'#DF3D82'
    };

    const buttonStyleTwo = {
      marginLeft:30,
      marginRight:30,
      elevation:0,
      backgroundColor:'#CCCCCC'
    };

    const textStyleTwo = {
      color:'#222222'
    };

    const facebookButton = {
      backgroundColor:'#3b5998',
      marginTop:10,
      marginLeft:15,
      marginRight:15,
      elevation:0,
    };

    const twitterButton = {
      backgroundColor:'#1dcaff',
      marginTop:10,
      marginLeft:15,
      marginRight:15,
      elevation:0,
    };

    const googleButton = {
      backgroundColor:'#EA4335',
      marginTop:10,
      marginLeft:15,
      marginRight:15,
      elevation:0,
    };

    const resetText = {
      marginTop:15,
      alignSelf:'center',
      color:'#CCCCCC',
      fontSize:11
    };

    const buttonText = {
      color:"#EEEEEE",
      fontWeight:"bold",
      fontSize:16,
    };

    return (
      <ScrollView>
        <Header style={appBar}>
          <Text style={titleStyle}>Sign In</Text>
        </Header>
        <Image style={backgroundContainer} source={{uri:'https://dl.dropboxusercontent.com/u/159328383/background.jpg'}}>
          <Image style={logoContainer} source={{uri:'http://h4z.it/Image/5c6fb6_braggrlogo.png'}} />
          <Text style={titleContainer}>Styler</Text>

          <View style={inputContainer}>
            <InputGroup borderType='underline' >
              <Icon name='md-mail' style={iconStyle}/>
              <Input style={inputStyle} value={this.state.email} onChange={this.handleEmail} placeholder='E-Mail' placeholderTextColor="#AAAAAA" selectionColor="#DF3D82"/>
            </InputGroup>

            <InputGroup>
              <Icon name='md-lock' style={iconStyle}/>
              <Input placeholder='Password' secureTextEntry={true} style={inputStyle} value={this.state.password} onChange={this.handlePassword} placeholderTextColor="#AAAAAA" selectionColor="#DF3D82" />
            </InputGroup>

            <Button block style={buttonStyleOne} disabled={this.state.disalbeSubmit} onPress={() => this.signIn()}><Text style={buttonText}>Sign In</Text></Button>
            <Button block style={buttonStyleTwo} textStyle={styles.textStyleTwo} onPress={() => {NavigationActions.signup()}}><Text>Sign Up</Text></Button>
          </View>
          <Button block style={facebookButton} onPress={() => {this.facebookSignIn()}}><MyCon size={20} color="#EEEEEE" name='facebook' /><Text style={buttonText}> Facebook</Text></Button>
          <Button block style={twitterButton} onPress={() => {this.twitterSignIn()}}><MyCon size={20} color="#EEEEEE" name='twitter' /><Text style={buttonText}> Twitter</Text></Button>
          <Button block style={googleButton} onPress={() => {this.googleSignIn()}}><MyCon size={20} color="#EEEEEE" name='google' /><Text style={buttonText}> Google</Text></Button>
          <Text style={resetText} onPress={() => { this.showReset(!this.state.resetModal)}}>Lost Password?</Text>
        </Image>
        <Modal animationType={"slide"} transparent={false} visible={this.state.resetModal}  onRequestClose={() => {}}>
          <Image style={backgroundContainer} source={{uri:'https://dl.dropboxusercontent.com/u/159328383/background.jpg'}}>
            <Image style={logoContainer} source={{uri:'http://h4z.it/Image/5c6fb6_braggrlogo.png'}} />
            <Text style={resetText}>Confirm your E-mail and we will send you a temporary password.</Text>

            <View style={inputContainer}>
              <InputGroup borderType='underline' >
                <Icon name='md-mail' style={iconStyle}/>
                <Input placeholder='E-Mail' style={inputStyle} value={this.state.reset} onChange={this.handleReset}/>
              </InputGroup>

              <Button block style={buttonStyleOne} onPress={() => this.resetPassword()}><Text>Confirm</Text></Button>
              <Button block style={buttonStyleTwo} textStyle={textStyleTwo} onPress={() => { this.showReset(!this.state.resetModal)}}><Text>Cancel</Text></Button>
            </View>
          </Image>
        </Modal>
      </ScrollView>
    )
  }
}

export default SignIn
