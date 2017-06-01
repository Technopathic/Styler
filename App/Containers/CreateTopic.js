// @flow

import React from 'react'
import { View, ScrollView, Text, AsyncStorage, TextInput, TouchableOpacity, Image, Modal, Dimensions } from 'react-native'
import Autocomplete from 'react-native-autocomplete-input'
import { Container, Header, Content, InputGroup, List, ListItem, Button, Toast, Body, Picker, Item, Right} from 'native-base';
import { Actions as NavigationActions } from 'react-native-router-flux';
import ImagePicker from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MyCon from 'react-native-vector-icons/Ionicons';

// Styles
import styles from './Styles/CreateTopicStyle'

class CreateTopic extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
     token:"",
     topicImg:[],
     articleOpen:false,
     previewImg:[],
     disableSubmit: false,
     showToast: false,
     topicArticles:[],
     itemType:"Shirt",
     itemBrand:"",
     itemLink:"",
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
  };

  handleTopicBody = (event) => {
   var input = event.nativeEvent.text;
   this.setState({
     topicBody: input,
     chars_left: 5000 - input.length
   })
  };

  handleItemType = (value) => {
    this.setState({
      itemType:value
    });
  };

  handleItemBrand = (event) => {
   this.setState({
     itemBrand: event.nativeEvent.text
   })
  };

  handleItemLink = (event) => {
   this.setState({
     itemLink: event.nativeEvent.text
   })
  };

  showArticles = () => {
    if(this.state.articleOpen === true)
    {
      this.setState({
        articleOpen:false
      })
    }
    else {
      this.setState({
        articleOpen:true
      })
    }
  };

  handleImage = () => {
    var topicImg = this.state.topicImg;
    var previewImg = this.state.previewImg;

    var options = {
      title: 'Select Image',
      storageOptions: {
        skipBackup: true,
        path: 'images'
      }
    };

    ImagePicker.showImagePicker(options, (response) => {
      if(topicImg.length < 5)
      {
        topicImg.push(response.data);
        previewImg.push('data:image/jpeg;base64,' + response.data)
        this.setState({
          topicImg: topicImg,
          previewImg: previewImg
        });
      }
      else {
        this.showToast('You can only have 5 photos.');
      }
    });
  };

  removeImage = (index) => {
    var topicImg = this.state.topicImg;
    var previewImg = this.state.previewImg;

    topicImg.splice(index, 1);
    previewImg.splice(index, 1);

    this.setState({
      topicImg:topicImg,
      previewImg:previewImg
    })
  };

  storeItem = () => {
    var item = {
      'itemType':this.state.itemType,
      'itemBrand':this.state.itemBrand,
      'itemLink':this.state.itemLink
    };

    var topicArticles = this.state.topicArticles;
    topicArticles.push(item);
    this.setState({
      topicArticles:topicArticles,
      itemLink:"",
      itemBrand:"",
      itemType:"Shirt"
    }, function() {
      this.showToast('Item Added.');
      this.showArticles();
    })
  };

  removeItem = (index) => {
    var topicArticles = this.state.topicArticles;
    for(var i = 0; i < topicArticles.length; i++)
    {
      if(i === index)
      {
        topicArticles.splice(index, 1);
        this.setState({
          topicArticles:topicArticles
        }, function() {
          this.showToast('Item Removed.');
        })
      }
    }
  };

  storeTopic() {
    var _this = this;

    var data = new FormData();
    data.append('topicImg', this.state.topicImg);
    data.append('topicArticles', this.state.topicArticles);

    fetch('http://bragger.technopathic.me/api/storeTopic?token=' + this.state.token, {
      method: 'POST',
      body:data,
      headers: {
        'Authorization': 'Bearer ' + this.state.token
      }
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
          _this.showToast("Slow down, you've already posted in the last 2minutes");
        }
        else {
          _this.setState({
            disableSubmit:true
          })
          _this.showToast('Successfully Added!.');
          setTimeout(function(){NavigationActions.root({refresh: {index:0}})}, 3000);
        }
      }
    }.bind(this));
  };

  render () {

    const smallText = {
      fontSize:11,
      marginLeft:5,
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

    const chipStyle = {
      flex:1,
      flexDirection:'row'
    };

    const singleChip = {
      backgroundColor:'#EEEEEE',
      borderRadius:25,
      paddingTop:2,
      paddingBottom:2,
      paddingLeft:10,
      paddingRight:10,
      margin:3,
    };

    const tagIcon = {
      fontSize:16,
    };

    const autoInputStyle = {
      backgroundColor:'transparent',
      borderWidth:0,
      margin:0,
      marginBottom:0,
    };

    const autoStyle = {
      paddingLeft:10,
      paddingRight:10,
      paddingTop:3,
      paddingBottom:3,
      margin:0
    };

    const buttonStyleOne = {
      margin:15,
      elevation:0,
      backgroundColor:'#DF3D82',
    };

    const autocompleteContainerOne = {
      flex: 1,
      left: 0,
      position: 'absolute',
      right: 0,
      top: -200,
      zIndex: 1
    };

    const autocompleteContainerTwo = {
      flex: 1,
      left: 0,
      position: 'absolute',
      right: 0,
      top: -400,
      zIndex: 1
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

    const contentStyle = {
      padding:10
    }

    const uploadButton = {
      flex:1,
      marginTop:10,
      marginBottom:10,
      backgroundColor:'#DDDDDD',
      elevation:0,
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

    return (
      <ScrollView>
        <Header style={appBar}>
          <Text style={titleStyle}>New Outfit</Text>
        </Header>
        <Content style={contentStyle}>
          <View style={{ flexDirection:'row', flexWrap:'wrap', justifyContent:'flex-start'}}>
            {this.state.previewImg.map((img, index) => (
              <View key={index} style={{width:Dimensions.get('window').width * 0.30, height:125, padding:1}}>
                <Image style={{flex:1, height:125}} source={{uri:img}} onPress={() => this.removeImage(index)}/>
              </View>
            ))}
          </View>
          <Button block style={uploadButton} onPress={() => {this.handleImage()}}><Icon name='photo-camera' size={25} style={{color:'#FFFFFF'}} /></Button>
          <Button block style={uploadButton} onPress={() => this.showArticles()}><MyCon name='ios-shirt' size={25} style={{color:'#FFFFFF'}} /></Button>
          <List>
            {this.state.topicArticles.map((article, index) => (
              <ListItem key={index}>
                <Body>
                    <Text style={{fontWeight:'bold'}}>{article.itemBrand}</Text>
                    <Text note style={{fontSize:11}}>{article.itemType}</Text>
                </Body>
                <Right>
                  <Button transparent>
                    <Icon name='close' size={20} style={{color:'#CCCCCC'}} onPress={() => this.removeItem(index)}/>
                  </Button>
                </Right>
              </ListItem>
            ))}
          </List>
        </Content>
        <Button block style={buttonStyleOne} onPress={() => this.storeTopic()} disabled={this.state.disableSubmit}><Text style={{color:'#FFFFFF', fontWeight:'bold'}}>Done</Text></Button>
        <Modal animationType={"slide"} transparent={false} visible={this.state.articleOpen}  onRequestClose={() => {}}>
          <View style={{padding:15}}>
            <Picker
              supportedOrientations={['portrait','landscape']}
              iosHeader="Type of Clothing"
              mode="dropdown"
              selectedValue={this.state.itemType}
              onValueChange={this.handleItemType}>
              <Item label="Shirt" value="Shirt" />
              <Item label="Blouse" value="Blouse" />
              <Item label="Tanktop" value="Tanktop" />
              <Item label="Jeans" value="Jeans" />
            </Picker>
            <TextInput value={this.state.itemBrand} onChange={this.handleItemBrand} placeholder='Item Brand' selectionColor="#DF3D82" underlineColorAndroid="#DF3D82"/>
            <TextInput value={this.state.itemLink} onChange={this.handleItemLink} placeholder='Item Link' selectionColor="#DF3D82" underlineColorAndroid="#DF3D82"/>
            <Button block style={buttonStyleOne} onPress={() => this.storeItem()}><Text style={{color:'#FFFFFF', fontWeight:'bold'}}>Confirm</Text></Button>
            <Button block style={buttonStyleTwo} textStyle={textStyleTwo} onPress={() => { this.showArticles(!this.state.articleOpen)}}><Text>Cancel</Text></Button>
          </View>
        </Modal>
      </ScrollView>
    )
  }
}

export default CreateTopic
