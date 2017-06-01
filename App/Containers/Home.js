// @flow

import React, { Component } from 'react'
import { ScrollView, Image, View, AsyncStorage, Dimensions, Modal, Share, FlatList } from 'react-native'
import { Actions as NavigationActions } from 'react-native-router-flux'

import { Header, Container, Content, Card, CardItem, Left, Body, Right, Thumbnail, Text, Button, Footer, List, ListItem, Spinner, ActionSheet} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MIcon from 'react-native-vector-icons/MaterialCommunityIcons';

// Styles
import styles from './Styles/HomeStyle'

export default class Home extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topics: [],
      token:"",
      nextPage:1,
      currentPage:0,
      lastPage:1,
      isLoading:true,
      result:"",
      loadMode:'New',
      thumbnails:[
        {
          topicThumbnail:"http://styler.technopathic.me/storage/media/topics/image/thumbnails/zs62B084TlQDmrf.png",
          active:true,
          topicID:1
        },
        {
          topicThumbnail:"http://styler.technopathic.me/storage/media/topics/image/thumbnails/joNGbWpipvKLI5A.png",
          active:false,
          topicID:1
        },
        {
          topicThumbnail:"http://styler.technopathic.me/storage/media/topics/image/thumbnails/PgibhygLRZBwgkc.png",
          active:false,
          topicID:1
        },
      ]
    };
  };

  async componentWillMount() {
    await AsyncStorage.getItem("token")
    .then((value) => {
      this.setState({"token": value});
    })
    .then(() => {
      this.getTopics();
    });
  };


  getTopics = () => {
    var nextPage = this.state.nextPage;
    var topics = this.state.topics;
    if(this.state.currentPage !== this.state.lastPage)
    {
      fetch('http://styler.technopathic.me/api/getTopics?page='+this.state.nextPage+'&token=' + this.state.token, {
        headers: {
          'Authorization':'Bearer ' +this.state.token
        }
      })
       .then(function(response) {
         return response.json()
       })
       .then(function(json) {
        if(json.error) {
          NavigationActions.signin();
        }
        else {
          if(json.current_page !== json.last_page)
          {
             nextPage = nextPage + 1;
          }
          for(var i = 0; i < json.data.length; i++)
          {
            topics.push(json.data[i]);
          }
          this.setState({
            nextPage: nextPage,
            lastPage: json.last_page,
            currentPage: json.current_page,
            topics: topics,
            isLoading:false
          })
        }
       }.bind(this));
    }
  };

  getHot = () => {
    var nextPage = this.state.nextPage;
    var topics = this.state.topics;
    if(this.state.currentPage !== this.state.lastPage)
    {
      fetch('http://styler.technopathic.me/api/getHot?page='+this.state.nextPage+'&token=' + this.state.token, {
        headers: {
          'Authorization':'Bearer ' +this.state.token
        }
      })
       .then(function(response) {
         return response.json()
       })
       .then(function(json) {
        if(json.error) {
          NavigationActions.signin();
        }
        else {
          if(json.current_page !== json.last_page)
          {
             nextPage = nextPage + 1;
          }
          for(var i = 0; i < json.data.length; i++)
          {
            topics.push(json.data[i]);
          }
          this.setState({
            nextPage: nextPage,
            lastPage: json.last_page,
            currentPage: json.current_page,
            topics: topics,
            isLoading:false
          })
        }
       }.bind(this));
    }
  };

  moreTopics = () => {
    if(this.state.loadMode === 'New')
    {
      this.getTopics();
    }
    else if(this.state.loadMode === 'Best')
    {
      this.getHot();
    }
  }

  voteTopic(id, dir) {
    var topics = this.state.topics;

    fetch('http://styler.technopathic.me/api/voteTopic/'+id+'?token=' + this.state.token, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + this.state.token
      },
      body: JSON.stringify({
        dir: dir
      })
    }).then(function(response) {
        return response.json()
    })
    .then(function(voteRes) {
      if(voteRes === 1)
      {
        for(var i = 0; i < topics.length; i++)
        {
          if(topics[i].id === id)
          {
            topics[i].vote = 1;
            topics[i].topicVotes = topics[i].topicVotes + 1;
          }
        }
      } else if(voteRes === 2)
      {
        for(var i = 0; i < topics.length; i++)
        {
          if(topics[i].id === id)
          {
            topics[i].vote = 0;
            topics[i].topicVotes = topics[i].topicVotes - 1;
          }
        }
      } else if(voteRes === 3)
      {
        for(var i = 0; i < topics.length; i++)
        {
          if(topics[i].id === id)
          {
            topics[i].vote = 2;
            topics[i].topicVotes = topics[i].topicVotes - 1;
          }
        }
      } else if(voteRes === 4)
      {
        for(var i = 0; i < topics.length; i++)
        {
          if(topics[i].id === id)
          {
            topics[i].vote = 0;
            topics[i].topicVotes = topics[i].topicVotes + 1;
          }
        }
      }
      this.setState({topics:topics})
    }.bind(this));
  };

  setVote(topic)
  {

    const activeStyle = {
      backgroundColor:"#DF3D82"
    };

    const optionStyle = {
      flex:1,
      flexDirection:'row',
      justifyContent:'space-around',
      marginTop:3
    };

    const activeIcon = {
      fontSize:20,
      color:'#EEEEEE'
    };

    const iconStyle = {
      fontSize:20,
      color:'#666666'
    };

    var upVote = <Button transparent onPress={() => this.voteTopic(topic.id, 1)}><Icon name="favorite-border" style={iconStyle}/></Button>;
    var selectUp = <Button transparent style={activeStyle} onPress={() => this.voteTopic(topic.id, 1)}><Icon name="favorite" style={activeIcon}/></Button>;

    var replies = <Button transparent onPress={() => {NavigationActions.detail({id:topic.id})}}><Icon name="chat-bubble-outline" style={iconStyle}/></Button>;
    var share = <Button transparent onPress={() => this.shareText(topic)}><Icon name="share" style={iconStyle}/></Button>;


    if(topic.vote === 0) {
      return (
        <View style={optionStyle}>
          {upVote}{replies}{share}
        </View>
      );
    } else if(topic.vote === 1) {
      return (
        <View style={optionStyle}>
          {selectUp}{replies}{share}
        </View>
      );
    } else if(topic.vote === 2) {
      return (
        <View style={optionStyle}>
          {upVote}{replies}{share}
        </View>
      );
    }
  };

  renderEnd()
  {
    const noTopics = {
      color:'#555555',
      fontSize:11,
      fontStyle:'italic',
      padding:15,
      flex:1,
      justifyContent:'center'
    };

    if(this.state.currentPage === this.state.lastPage)
    {
      return(
        <Text style={noTopics}>
          You have reached the end.
        </Text>
      );
    }
  };

 shareText = (topic) => {
   Share.share({
     message: topic.topicBody,
     url: 'http://brag.technopathic.me/share/'+topic.id,
     title: topic.topicTitle
   }, {
     dialogTitle: 'Share this Topic',
     excludedActivityTypes: [
       'com.apple.UIKit.activity.PostToTwitter'
     ],
     tintColor: 'green'
   })
   .then(this.showResult)
   .catch((error) => this.setState({result: 'error: ' + error.message}));
 };

 showResult = (result) => {
    if (result.action === Share.sharedAction) {
      if (result.activityType) {
        this.setState({result: 'shared with an activityType: ' + result.activityType});
      } else {
        this.setState({result: 'shared'});
      }
    } else if (result.action === Share.dismissedAction) {
      this.setState({result: 'dismissed'});
    }
  }



  renderImages = (thumbnail, index) => {

    const cardImage = {
      flex:1,
      borderBottomWidth:0,
      borderTopWidth:0,
      paddingTop:5,
      paddingBottom:5,
    };

    /**/
    if(thumbnail.active === true)
    {
      return(
        <Image style={{ flex:1, width:Dimensions.get('window').width, height:300 }} resizeMode='cover' source={{uri:thumbnail.topicThumbnail}} key={index}/>
      );
    }
  }

  changeActive = (thumbnail, index) => {
    var topics = this.state.topics;
    for(var i = 0; i < topics.length; i++)
    {
      if(topics[i].id === thumbnail.topicID)
      {
        for(var j = 0; j < topics[i].topicThumbnail.length; i++)
        {
          if(j === index)
          {
            topics[i].topicThumbnail[j].active = true;
          }
          else {
            topics[i].topicThumbnail[j].active = false;
          }
        }
        this.setState({
          topics:topics
        })
      }
    }
  }

  changeNext = (thumbnail, index) => {
    var topics = this.state.topics;
    for(var i = 0; i < topics.length; i++)
    {
      if(topics[i].id === thumbnail.topicID)
      {
        for(var j = 0; j < topics[i].topicThumbnail.length; i++)
        {
          if(j === index)
          {
            topics[i].topicThumbnail[j].active === false;
            if(j + 1 < topics[i].topicThumbnail.length)
            {
              topics[i].topicThumbnail[j+1].active === true;
            }
            else {
              topics[i].topicThumbnail[0].active === true;
            }
          }
        }
        this.setState({
          topics:topics
        })
      }
    }
  }

  changePrevious = (thumbnail, index) => {
    var topics = this.state.topics;
    for(var i = 0; i < topics.length; i++)
    {
      if(topics[i].id === thumbnail.topicID)
      {
        for(var j = 0; j < topics[i].topicThumbnail.length; i++)
        {
          if(j === index)
          {
            topics[i].topicThumbnail[j].active === false;
            if(j - 1 > 0)
            {
              topics[i].topicThumbnail[j-1].active === true;
            }
            else {
              topics[i].topicThumbnail[topics[i].topicThumbnail.length - 1].active === true;
            }
          }
        }
        this.setState({
          topics:topics
        })
      }
    }
  }

  renderButtons = (thumbnail, index) => {

    const imageButton = {
      height:10,
      width:10,
      borderWidth:1,
      borderRadius:5,
      margin:5,
      borderColor:'#999999'
    };

    const activeButton = {
      height:10,
      width:10,
      borderWidth:1,
      borderRadius:5,
      margin:5,
      borderColor:'#DF3D82',
      backgroundColor:'#DF3D82'
    };
    if(thumbnail.active === true)
    {
      return(
        <View style={activeButton} key={index}></View>
      )
    }
    else {
      return(
        <View style={imageButton} key={index} onPress={() => this.changeActive(thumbnail, index)}></View>
      )
    }
  }

  renderTopics = (topic) => {
    var topic = topic.item;

    const cardStyle = {
      flex: 1,
      shadowOpacity:0,
      elevation:0,
      borderLeftWidth:0,
      borderRightWidth:0,
      borderTopWidth:0,
      borderBottomWidth:1,
      borderBottomColor:'#EAEAEA',
      borderRadius:0,
      marginBottom:0,
      marginTop:0,
    };

    const cardHead = {
      flex:1,
      flexDirection:'row',
      paddingLeft:10,
      paddingRight:10,
      paddingTop:5,
    };

    const cardImage = {
      flex:1,
      borderBottomWidth:0,
      borderTopWidth:0,
      paddingTop:5,
      paddingBottom:5,
      flexDirection:'column',
      justifyContent:'center'
    };

    const headerStyle = {
      flex:1,
      flexDirection:'column',
      paddingLeft:10
    };

    const headerText = {
      marginBottom:0,
      paddingBottom:0,
    };

    const itemStyle = {
      paddingTop:0,
      paddingBottom:10,
      paddingLeft:10,
      paddingRight:10,
    };

    const smallText = {
      fontSize:11,
      color:'#777777',
      fontFamily:'Montserrat-Regular'
    };

    const noteText = {
      fontSize:11,
      color:'#777777',
      marginTop:-12
    };

    const noGutter = {
      paddingTop:0,
      paddingBottom:0,
      marginTop:0,
      marginBottom:0
    };

    const imageSelect = {
      flex:1,
      flexDirection:'row',
      justifyContent:'center'
    };

    return(
      <View style={cardStyle}>
        <View style={cardHead}>
          <Thumbnail source={{uri:topic.avatar}} small onPress={() => {NavigationActions.profile({uid:topic.userID})}}/>
          <View style={headerStyle}>
            <Text style={{fontSize:14, fontFamily:'Montserrat-Regular'}} onPress={() => {NavigationActions.profile({uid:topic.userID})}}>{topic.profileName}</Text>
            <Text note style={{fontSize:11, fontFamily:'Montserrat-Regular'}} onPress={() => {NavigationActions.profile({uid:topic.userID})}}>{topic.topicDate}</Text>
          </View>
        </View>
        <View style={cardImage} onPress={() => {NavigationActions.detail({id:topic.id})}}>
          <Image style={{ flex:1, width:Dimensions.get('window').width, height:300 }} resizeMode='cover' source={{uri:topic.topicThumbnail}} />
        </View>
        <View style={cardImage} >
          {this.state.thumbnails.map((thumbnail, index) => (
            this.renderImages(thumbnail, index)
          ))}
        </View>
        <View style={imageSelect}>
          {this.state.thumbnails.map((thumbnail, index) => (
            this.renderButtons(thumbnail, index)
          ))}
        </View>

        <View style={{paddingLeft:10, paddingRight:10}}>
          <Text style={smallText} onPress={() => {NavigationActions.detail({id:topic.id})}}>
            {topic.topicVotes} Likes &middot; {topic.topicReplies} Replies
          </Text>
        </View>
        <View style={noGutter}>
          {this.setVote(topic)}
        </View>
      </View>
    )
  }



  render () {

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

    const mainContainer = {
      flex:1,
      flexDirection:'column',
    }

    const spinnerStyle = {
      flex:1,
      height:Dimensions.get('window').height,
      justifyContent:'center',
      alignItems:'center'
    }

    if (this.state.isLoading) {
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
              <Text style={titleStyle} onPress={() => ActionSheet.show(
                {
                  options: ['New', 'Best'],
                  title:'Options'
                },
                (buttonIndex) => {
                  if(buttonIndex == 0)
                  {
                    this.setState({
                      topics: [],
                      nextPage:1,
                      currentPage:0,
                      lastPage:1,
                      isLoading:true,
                      loadMode:'New'
                    }, function() {
                      this.getTopics();
                    })
                  }
                  else if(buttonIndex == 1)
                  {
                    this.setState({
                      topics: [],
                      nextPage:1,
                      currentPage:0,
                      lastPage:1,
                      isLoading:true,
                      loadMode:'Best'
                    }, function() {
                      this.getHot();
                    })
                  }
                }
              )}>Styler</Text>
            </Header>
            <FlatList
              data={this.state.topics}
              keyExtractor={(topic, index) => index}
              renderItem={this.renderTopics}
              onEndReached={this.moreTopics}
              onEndReachedThreshold={1}
              disableVirtualization={false}
            />
            <Content>
              {this.renderEnd()}
            </Content>
          </Container>
      )
    }
  }
}
