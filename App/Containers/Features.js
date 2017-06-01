// @flow

import React from 'react'
import { ScrollView, Image, View, AsyncStorage, StatusBar, Dimensions, Share, TouchableHighlight, FlatList } from 'react-native'
import { Actions as NavigationActions } from 'react-native-router-flux'

import { Container, Content, Header, Card, CardItem, Thumbnail, Text, Button, Left, Body, Right, Spinner } from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Styles
import styles from './Styles/FeaturesStyle'
import homeStyles from './Styles/HomeStyle'

class Features extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      topics: [],
      token: "",
      follows: [],
      shareOpen: false,
      nextPage:1,
      currentPage:0,
      lastPage:1,
      isLoading:true
    };
  };

  async componentWillMount() {
    await AsyncStorage.getItem("token")
    .then((value) => {
      this.setState({"token": value});
    })
    .then(() => {
      this.getFeature();

      fetch('http://bragger.technopathic.me/api/suggestFollows?token=' + this.state.token, {
        headers:{
          'Authorization': 'Bearer ' + this.state.token
        }
      })
       .then(function(response) {
         return response.json()
       })
       .then(function(json) {
         if(json.error === "token_not_provided")
         {
           this.context.router.push('signin');
         }
         else {
           this.setState({
             follows: json
           })
         }
       }.bind(this));
    });
  };

  getFeature = () => {
    var nextPage = this.state.nextPage;
    var topics = this.state.topics;
    if(this.state.currentPage !== this.state.lastPage)
    {
      fetch('http://bragger.technopathic.me/api/getFollowTopics?page='+this.state.nextPage+'&token=' + this.state.token, {
        headers:{
          'Authorization': 'Bearer ' + this.state.token
        }
      })
       .then(function(response) {
         return response.json()
       })
       .then(function(json) {
         if(json.error === "token_not_provided")
         {
           this.context.router.push('signin');
         }
         else {
           if(json.current_page !== json.last_page)
           {
              nextPage = nextPage + 1;
           }
           for(var i = 0; i < json.length; i++)
           {
             topics.push(json[i]);
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

  handleShareOpen = () => {
    this.setState({shareOpen: true});
  };

  handleShareClose = () => {
    this.setState({shareOpen: false});
  };

  voteTopic(id, dir) {
    var topics = this.state.topics;

    fetch('http://bragger.technopathic.me/api/voteTopic/'+id+'?token=' + this.state.token, {
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
   };

  renderEnd()
  {
    const noTopics = {
      color:'#555555',
      fontSize:11,
      fontStyle:'italic',
      padding:15,
      flex:1,
      justifyContent:'center',
      alignSelf:'center'
    };

    if(this.state.currentPage === this.state.lastPage && this.state.topics.length !== 0)
    {
      return(
        <Text style={noTopics}>
          You have reached the end.
        </Text>
      );
    }
  };

  noFeeds()
  {
    const noTopics = {
      color:'#555555',
      fontSize:11,
      fontStyle:'italic',
      padding:15,
      flex:1,
      justifyContent:'center',
      alignSelf:'center'
    };

    if(this.state.topics.length === 0)
    {
      return(
        <Text style={noTopics}>
          Follow others to see new feeds.
        </Text>
      );
    }
  };

  renderSuggests()
  {
    const followStyle = {
      flex:1,
      flexDirection:"row",
      padding:15,
    };

    const followBox = {
      marginRight:20,
      flex:1,
      flexDirection:"column",
    };

    const followName = {
      width:60,
      color:"#333333",
      textAlign:'center',
      fontFamily:'Montserrat-Regular',
      fontSize:12
    };

    if(this.state.follows.length !== 0)
    return(
      <ScrollView horizontal={true} style={followStyle}>
        {this.state.follows.map((follow, i) => (
          <TouchableHighlight style={followBox} key={i} onPress={() => {NavigationActions.profile({uid:follow.id})}} underlayColor='#FFFFFF'>
            <View>
              <Thumbnail size={80} source={{uri:follow.avatar}}/>
              <Text style={followName}>{follow.name}</Text>
            </View>
          </TouchableHighlight>
        ))}
      </ScrollView>
    );
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

    return(
      <View style={cardStyle} key={topic.id}>
        <View style={cardHead} onPress={() => {NavigationActions.profile({uid:topic.userID})}}>
          <Thumbnail source={{uri:topic.avatar}} small />
          <View style={headerStyle}>
            <Text style={{fontSize:14, fontFamily:'Montserrat-Regular'}}>{topic.profileName}</Text>
            <Text note style={{fontSize:11, fontFamily:'Montserrat-Regular'}}>{topic.topicDate}</Text>
          </View>
        </View>
        <View style={cardImage} onPress={() => {NavigationActions.detail({id:topic.id})}}>
          <Image style={{ flex:1, width:Dimensions.get('window').width, height:300 }} resizeMode='cover' source={{uri:topic.topicThumbnail}} />
        </View>
        <View style={itemStyle}>
          <Text onPress={() => {NavigationActions.detail({id:topic.id})}} style={{fontFamily:'Lato-Regular'}}>
            {topic.topicBody}
          </Text>
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
      fontFamily:"Lobster-Regular"
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
        <Container>
          <Header style={appBar}>
            <Text style={titleStyle}>Feed</Text>
          </Header>
          {this.renderSuggests()}
          <FlatList
            style={{borderTopWidth:1, borderTopColor:'#EEEEEE'}}
            data={this.state.topics}
            keyExtractor={(topic, index) => index}
            renderItem={this.renderTopics}
            onEndReached={this.getFeature}
            onEndReachedThreshold={1}
            disableVirtualization={false}
          />
          <Content>
            {this.noFeeds()}
            {this.renderEnd()}
          </Content>
        </Container>
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

export default Features
