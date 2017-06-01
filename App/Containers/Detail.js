// @flow

import React from 'react';
import { ScrollView, Image, View, AsyncStorage, Modal, Dimensions, TextInput, FlatList } from 'react-native';
import { Actions as NavigationActions } from 'react-native-router-flux';

import { Container, Header, Content, Card, CardItem, Thumbnail, Text, Button, Left, Body, Right, List, ListItem, Footer, Input, Toast, ActionSheet, Spinner} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Styles
import detailStyles from './Styles/DetailStyle'
import styles from './Styles/HomeStyle'

class Detail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      token:"",
      user:"",
      topic: null,
      replies:[],
      chars_left: 1000,
      replyBody:"",
      replyMentions:[],
      selectReply:0,
      shareOpen: false,
      nextPage:1,
      currentPage:0,
      lastPage:1,
      topicLoading:true,
      repliesLoading:true,
      optionsModal: false,
      reportModal: false,
      deleteModal: false,
      replyModal: false,
      reportReplyModal: false,
      deleteReplyModal: false,
      showToast:false,
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
     this.getTopic();
     this.getReplies();
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
        topic: json,
        topicLoading:false
      })
    }.bind(this));
  };

  getReplies = () => {
    var nextPage = this.state.nextPage;
    var replies = this.state.replies;
    if(this.state.currentPage !== this.state.lastPage)
    {
      fetch('http://styler.technopathic.me/api/getReplies/'+this.props.id+'?page='+this.state.nextPage+'&token='+this.state.token, {
        headers:{
          'Authorization': 'Bearer ' + this.state.token
        }
      })
       .then(function(response) {
         return response.json()
       })
       .then(function(json) {
         if(json.current_page !== json.last_page)
         {
            nextPage = nextPage + 1;
         }
         for(var i = 0; i < json.data.length; i++)
         {
           replies.push(json.data[i]);
         }
         this.setState({
           nextPage: nextPage,
           lastPage: json.last_page,
           currentPage: json.current_page,
           replies: replies,
           repliesLoading:false
         })
       }.bind(this));
     }
  };

  storeReply = () => {
    var _this = this;
    var replies = this.state.replies;

    fetch('http://styler.technopathic.me/api/storeReply?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      },
      body: JSON.stringify({
        topicID: this.props.id,
        replyBody: this.state.replyBody
      })
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast("There was a problem posting this.");
      }
      else {
        if(json === 0)
        {
          _this.showToast("You cannot make an empty post.");
        }
        else if(json === 2)
        {
          _this.showToast("You do not have permission.");
        }
        else if(json === 3)
        {
          _this.showToast("You can only have 1 Mention.");
        }
        else if(json === 4)
        {
          _this.showToast("Your reply is too long.");
        }
        else if(json === 5)
        {
          _this.showToast("You're posting too quickly.");
        }
        else if(json === 6)
        {
          _this.showToast("This topic has reached it's maximum potential.");
        }
        else
        {
          replies.push(json);
          _this.setState({
            replies:replies
          })
          _this.showToast("Successfully Added!");
        }
      }
    });
  };

  storeRealReply = (messages = []) => {
    var _this = this;
    fetch('http://styler.technopathic.me/api/storeRealReply?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      },
      body: JSON.stringify({
        topicID: this.props.id,
        replyBody: messages[0].text
      })
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast("There was a problem posting this.");
      }
      else {
        if(json === 0)
        {
          _this.showToast("You cannot make an empty post.");
        }
        else if(json === 2)
        {
          _this.showToast("You do not have permission.");
        }
        else if(json === 3)
        {
          _this.showToast("You can only have 1 Mention.");
        }
        else if(json === 4)
        {
          _this.showToast("Your reply is too long.");
        }
        else if(json === 5)
        {
          _this.showToast("You're posting too quickly.");
        }
        else if(json === 6)
        {
          _this.showToast("This topic has reached it's maximum potential.");
        }
        else if(json === 1)
        {
          _this.showToast("Successfully Added!");
        }
      }
    });
  };

  handleShareOpen = () => {
    this.setState({shareOpen: true});
  };

  handleShareClose = () => {
    this.setState({shareOpen: false});
  };

  showReport(visible) { this.setState({optionsModal:false, reportModal: visible}); }
  showDelete(visible) { this.setState({optionsModal:false, deleteModal: visible}); }

  showReplyReport(visible) { this.setState({replyModal:false, reportReplyModal: visible}); }
  showReplyDelete(visible) { this.setState({replyModal:false, deleteReplyModal: visible}); }

  deleteTopic() {
    var _this = this;

    fetch('http://styler.technopathic.me/api/deleteTopic/'+this.props.id+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
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
          _this.showToast('You do not have permission.');
        }
        else if(json === 1)
        {
          _this.showDelete(!this.state.deleteModal)
          _this.showToast('Topic was deleted.');
          setTimeout(function(){NavigationActions.root()}, 2000);
        }
      }
    });
  };

  reportTopic(id)
  {
    var _this = this;

    fetch('http://styler.technopathic.me/api/reportTopic/'+id+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast('There was a problem reporting this topic.');
      }
      else {
        if(json === 0)
        {
          _this.showToast('You do not have permission.');
        }
        else if(json === 1)
        {
          _this.showReport(!this.state.reportModal);
          _this.showToast('Topic was reported.');
        }
        else if(json === 2)
        {
          _this.showReport(!this.state.reportModal);
          _this.showToast('You cannot report yourself.');
        }
      }
    });
  };

  unReportTopic(id)
  {
    var _this = this;

    fetch('http://styler.technopathic.me/api/unReportTopic/'+id+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast('There was a problem clearing this topic.');
      }
      else {
        if(json === 0)
        {
          _this.showToast('You do not have permission.');
        }
        else if(json === 1)
        {
          _this.showToast('Topic was cleared');
        }
      }
    });
  };

  deleteReply(id) {
    var _this = this;

    fetch('http://styler.technopathic.me/api/deleteReply/'+id+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast('There was a problem deleting this.');
      }
      else {
        if(json === 0)
        {
          _this.showToast('You do not have permission.');
        }
        else if(json === 1)
        {
          _this.showReplyDelete(!this.state.deleteReplyModal);
          _this.showToast('Reply was deleted.');
        }
      }
    });
  }

  reportReply(id) {
    var _this = this;

    fetch('http://styler.technopathic.me/api/reportReply/'+id+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast('There was a problem reporting this reply.');
      }
      else {
        if(json === 0)
        {
          _this.showToast('You do not have permission.');
        }
        else if(json === 1)
        {
          _this.showReplyReport(!this.state.reportReplyModal);
          _this.showToast('Reply was reported.');
        }
        else if(json === 2)
        {
          _this.showReplyReport(!this.state.reportReplyModal);
          _this.showToast('You cannot report yourself.');
        }
      }
    });
  };

  unReportReply(id)
  {
    var _this = this;

    fetch('http://styler.technopathic.me/api/unReportReply/'+id+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
        return response.json()
    })
    .then(function(json) {
      if(json.error)
      {
        _this.showToast('There was a problem clearing this reply.');
      }
      else {
        if(json === 0)
        {
          _this.showToast('You do not have permission.');
        }
        else if(json === 1)
        {
          _this.showReplyReport(!this.state.reportReplyModal);
          _this.showToast('Reply was cleared.');
        }
      }
    });
  };

  optionButtons = () => {
    var options = ['Report', 'Share'];
    if(this.state.user.user.role == 1 || this.state.user.user.id == this.state.topic.userID)
    {
      options.push('Edit');
      options.push('Delete');
    }

    return options;
  }

  optionReplyButtons = () => {
    var options = ['Report'];
    if(this.state.user.user.role == 1)
    {
      options.push('Delete');
    }

    return options;
  }

  renderBubble = (props) => {
    //console.warn(JSON.stringify(props.messages));
    const nameStyle = {
      fontSize:11,
      color:'#888888',
      marginTop:-20,
      marginLeft:10
    }

    return (
      <View style={{flex:1, borderBottomWidth:1, borderBottomColor:'#EEEEEE'}}>
  			<Bubble
  				{...props}
          touchableProps={{
            onPress: () => {
              this.setState({
                selectReply:props.currentMessage._id
              });
              ActionSheet.show(
              {
              options: this.optionReplyButtons(),
              cancelButtonIndex:2,
              title:'Options'
              },
              (buttonIndex) => {
                if(buttonIndex == 0)
                {
                  this.showReplyDelete(!this.state.deleteReplyModal);
                }
                else if(buttonIndex == 1)
                {
                  this.showReplyReport(!this.state.reportReplyModal);
                }
              }
            )}
          }}
  				wrapperStyle={{
  					left: {
  						alignSelf: 'stretch',
  						marginRight: 0,
              borderRadius:0,
              backgroundColor:'transparent'
  					}
  				}}
  			/>
        <Text style={nameStyle}>{props.currentMessage.user.name}</Text>
      </View>
		);
	}

  renderReplies = (reply) => {
    var reply = reply.item

    return(
      <ListItem avatar key={index}
        onLongPress = {() => {
        this.setState({
          selectReply:reply.id
        });
        ActionSheet.show(
        {
        options: this.optionReplyButtons(),
        title:'Options'
        },
        (buttonIndex) => {
          if(buttonIndex == 0)
          {
            this.showReplyReport(!this.state.reportReplyModal);
          }
          else if(buttonIndex == 1)
          {
            this.showReplyDelete(!this.state.deleteReplyModal);
          }
        }
      )}}>
        <Left>
            <Thumbnail source={{uri:reply.avatar}} small/>
        </Left>
        <Body style={{flex:1, marginRight:5}}>
            <Text style={{fontSize:13, fontFamily:'Lato-Regular'}}>{reply.replyBody}</Text>
            <Text note style={{fontSize:11, fontFamily:'Montserrat-Regular'}}>{reply.profileName} - {reply.replyDate}</Text>
        </Body>
      </ListItem>
    );

  }


  render() {

    const appBar = {
      backgroundColor:"#263238",
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
      fontFamily:'Lobster-Regular'
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

    const spinnerStyle = {
      flex:1,
      height:Dimensions.get('window').height,
      justifyContent:'center',
      alignItems:'center'
    };

    if (this.state.topicLoading || this.state.repliesLoading) {
      return (
        <View style={spinnerStyle}>
          <Spinner color="#DF3D82"/>
        </View>
      )
    }
    else {
      return (
        <Container>
            <Header style={appBar}>
              <Left>
                <Button transparent onPress={() => NavigationActions.pop()}>
                  <Icon name='chevron-left' size={35} style={{color:'#EEEEEE'}} />
                </Button>
              </Left>
              <Body>
                <Text style={titleStyle}>Replies</Text>
              </Body>
              <Right style={{flex:1, flexDirection:'column'}}>
                <Button transparent onPress={() => ActionSheet.show(
                  {
                  options: this.optionButtons(),
                  cancelButtonIndex:3,
                  title:'Options'
                  },
                  (buttonIndex) => {
                    if(buttonIndex == 0)
                    {

                      this.showReport(!this.state.reportModal);
                    }
                    else if(buttonIndex == 1)
                    {

                    }
                    else if(buttonIndex == 2)
                    {
                      NavigationActions.editTopic({id:this.props.id});
                    }
                    else if(buttonIndex == 3)
                    {
                      this.showDelete(!this.state.deleteModal);
                    }
                  }
                )}>
                  <Icon name='more-vert' size={26} style={{color:'#EEEEEE'}} />
                </Button>
              </Right>
            </Header>
            <FlatList
              data={this.state.replies}
              keyExtractor={(reply, index) => index}
              renderItem={this.renderReplies}
              onEndReached={this.getReplies}
              onEndReachedThreshold={1}
              disableVirtualization={false}
            />

            <Footer style={{height:40, backgroundColor:'#FFFFFF', borderTopWidth:1, borderTopColor:'#DF3D82'}}>
              <TextInput selectionColor="#DF3D82" style={{height: 40, flex:1}} onChangeText={(text) => this.setState({replyBody:text})} value={this.state.replyBody} placeholder="Leave a reply" returnKeyType="send" onSubmitEditing={() => this.storeReply()} underlineColorAndroid='transparent'/>
            </Footer>

          <Modal animationType={"slide"} transparent={false} visible={this.state.reportModal}  onRequestClose={() => {}}>
            <View style={{padding:15}}>
              <Text style={{fontFamily:'Lato-Regular', fontSize:14, color:'#555555'}}>Are you sure you want to report this topic?</Text>

              <Button block style={buttonStyleOne} onPress={() => this.reportTopic()}><Text>Confirm</Text></Button>
              <Button block style={buttonStyleTwo} textStyle={styles.textStyleTwo} onPress={() => { this.showReport(!this.state.reportModal)}}><Text>Cancel</Text></Button>
            </View>
          </Modal>

          <Modal animationType={"slide"} transparent={false} visible={this.state.deleteModal}  onRequestClose={() => {}}>
            <View style={{padding:15}}>
              <Text style={{fontFamily:'Lato-Regular', fontSize:14, color:'#555555'}}>Are you sure you want to delete this topic?</Text>

              <Button block style={buttonStyleOne} onPress={() => this.deleteTopic()}><Text>Confirm</Text></Button>
              <Button block style={buttonStyleTwo} textStyle={styles.textStyleTwo} onPress={() => { this.showDelete(!this.state.deleteModal)}}><Text>Cancel</Text></Button>
            </View>
          </Modal>

          <Modal animationType={"slide"} transparent={false} visible={this.state.reportReplyModal}  onRequestClose={() => {}}>
            <View style={{padding:15}}>
              <Text style={{fontFamily:'Lato-Regular', fontSize:14, color:'#555555'}}>Are you sure you want to report this reply?</Text>

              <Button block style={buttonStyleOne} onPress={() => this.reportReply()}><Text>Confirm</Text></Button>
              <Button block style={buttonStyleTwo} textStyle={styles.textStyleTwo} onPress={() => { this.showReplyReport(!this.state.reportReplyModal)}}><Text>Cancel</Text></Button>
            </View>
          </Modal>

          <Modal animationType={"slide"} transparent={false} visible={this.state.deleteReplyModal}  onRequestClose={() => {}}>
            <View style={{padding:15}}>
              <Text style={{fontFamily:'Lato-Regular', fontSize:14, color:'#555555'}}>Are you sure you want to delete this reply?</Text>

              <Button block style={buttonStyleOne} onPress={() => this.deleteReply()}><Text>Confirm</Text></Button>
              <Button block style={buttonStyleTwo} textStyle={styles.textStyleTwo} onPress={() => { this.showReplyDelete(!this.state.deleteReplyModal)}}><Text>Cancel</Text></Button>
            </View>
          </Modal>
        </Container>
      );
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

export default Detail
