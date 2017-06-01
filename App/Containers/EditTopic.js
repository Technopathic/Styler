// @flow

import React from 'react'
import { View, ScrollView, Text, AsyncStorage, TextInput, TouchableOpacity, Image } from 'react-native'
import Autocomplete from 'react-native-autocomplete-input';
import { Actions as NavigationActions } from 'react-native-router-flux';

import { Container, Content, Header, InputGroup, List, ListItem, Button, Toast, Left, Body} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImagePicker from 'react-native-image-picker';

// Styles
import styles from './Styles/CreateTopicStyle'

class EditTopic extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
     token:"",
     chars_left: 5000,
     topicBody:"",
     topicImg:"",
     previewImg:null,
     disableSubmit: false,
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
    await AsyncStorage.getItem("token")
    .then((value) => {
      this.setState({token: value});
    })
    .then(() => {
      this.getTopic();
    })
  };

  getTopic = () => {
    fetch('http://styler.technopathic.me/api/showTopic/'+this.props.id+'?token='+this.state.token, {
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    })
    .then(function(response) {
      return response.json()
    })
    .then(function(json) {
      this.setState({
        topicBody: json.topicBody,
        topicImg: json.topicImg,
        previewImg: json.topicThumbnail,
        isLoading:false
      })
    }.bind(this));
  };

  handleTopicBody = (event) => {
   var input = event.nativeEvent.text;
   this.setState({
     topicBody: input,
     chars_left: 5000 - input.length
   })
  };

  handleImage = () => {
    var options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      let source = { uri: response.uri };
      this.setState({
        topicImg: response.data,
        previewImg: 'data:image/jpeg;base64,' + response.data
      });
    });
  };

  removeImage = () => {
    this.setState({
      topicImg:"",
      previewImg:null
    })
  };

  renderImageButtons = () => {
    const buttonContainer = {
      flex:1,
      flexDirection:'row',
    };

    const uploadButton = {
      flex:1,
      marginTop:10,
      marginBottom:10,
      backgroundColor:'#DDDDDD',
      elevation:0,
    };

    if(this.state.previewImg !== null) {
      return(
        <View style={buttonContainer}>
          <Button block style={uploadButton} onPress={() => {this.handleImage()}}><Icon name='redo' size={25} style={{color:'#FFFFFF'}} /></Button>
          <Button block style={uploadButton} onPress={() => {this.removeImage()}}><Icon name='remove-circle' size={25} style={{color:'#FFFFFF'}} /></Button>
        </View>
      );
    }
    else {
      return(
        <Button block style={uploadButton} onPress={() => {this.handleImage()}}><Icon name='photo-camera' size={25} style={{color:'#FFFFFF'}} /></Button>
      )
    }
  };

  updateTopic() {
    var _this = this;

    var data = new FormData();
    data.append('topicImg', this.state.topicImg);
    data.append('topicBody', this.state.topicBody);

    fetch('http://styler.technopathic.me/api/storeTopic?token=' + this.state.token, {
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
        _this.showToast('There was a problem posting this.');
      }
      else {
        if(json === 0)
        {
          _this.showToast('You cannot make an empty post.');
        }
        else if(json === 2)
        {
          _this.showToast('You do not have permission.');
        }
        else if(json === 3)
        {
          _this.showToast('You can only have 3 mentions.');
        }
        else if(json === 4)
        {
          _this.showToast('Your post is too long.');
        }
        else if(json === 5)
        {
          _this.showToast('Your image is too big.');
        }
        else if(json === 6)
        {
          _this.showToast('Not a valid PNG/JPG/GIF image.');
        }
        else if(json === 7)
        {
          _this.showToast('You can only have 10 tags.');
        }
        else if(json === 8)
        {
          _this.showToast("Slow down, you've already posted in the last 2minutes.");
        }
        else {
          _this.setState({
            disableSubmit:true
          })
          _this.showToast('Successfully Added!');
          setTimeout(function(){_this.context.router.push('/')}, 2000);
        }
      }
    });
  };

  render () {

    const smallText = {
      fontSize:11,
      fontFamily:'Montserrat-Regular'
    };

    const topicOptions = {
      flex:1,
      flexDirection:'row',
      justifyContent:'space-between'
    };

    const iconStyle = {
      color:'#666666',
      fontSize:22
    };

    const inputStyle = {
      marginTop:15
    };

    const buttonStyleOne = {
      margin:15,
      elevation:0,
      backgroundColor:'#DF3D82'
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
      fontFamily:"Lobster-Regular"
    };

    return (
      <ScrollView>
        <Header style={appBar}>
          <Left>
            <Button transparent onPress={() => NavigationActions.pop()}>
              <Icon name='chevron-left' size={35} style={{color:'#EEEEEE'}} />
            </Button>
          </Left>
          <Body>
            <Text style={titleStyle}>Edit Outfit</Text>
          </Body>
        </Header>
        <Content style={{padding:10}}>
          <TextInput multiline={true} numberOfLines = {4} value={this.state.topicBody} onChange={this.handleTopicBody} placeholder='The topic starts here...' selectionColor="#DF3D82" />
          <View style={topicOptions}>
            <Text style={smallText}>{this.state.chars_left}</Text>
          </View>
          {this.renderImageButtons()}
          <Image style={{ flex:1, height:300 }} source={{uri:this.state.previewImg}}/>
          <Button block style={buttonStyleOne} onPress={() => this.updateTopic()}><Text style={{color:'#FFFFFF', fontWeight:'bold'}}>Update</Text></Button>
        </Content>
      </ScrollView>
    )
  }
}

export default EditTopic
