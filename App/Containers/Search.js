// @flow

import React from 'react'
import { View, ScrollView, AsyncStorage, Image, Dimensions, FlatList } from 'react-native'
import { Container, Content, Header, Item, Input, Card, CardItem, Left, Body, Right, Thumbnail, Text, Button, List, ListItem, Icon, Spinner, Badge, Toast} from 'native-base';
import { Actions as NavigationActions } from 'react-native-router-flux'

// Styles
import styles from './Styles/SearchStyle'
import homeStyles from './Styles/HomeStyle'

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: [],
      topics: [],
      tagName:"",
      tagID:null,
      token:"",
      nextPage:1,
      currentPage:0,
      lastPage:1,
      nextTopic:2,
      currentTopic:1,
      lastTopic:1,
      isLoading:true
    };
  };

  async componentWillMount() {
    await AsyncStorage.getItem("token")
    .then((value) => {
      this.setState({token: value});
    })
    .then(() => {
      this.getTags();
    });
  };

  getTags = () => {
    var nextPage = this.state.nextPage;
    var tags = this.state.tags;
    if(this.state.currentPage !== this.state.lastPage)
    {
      fetch('http://bragger.technopathic.me/api/getTags?page='+this.state.nextPage+'&token=' + this.state.token, {
        headers:{
          'Authorization': 'Bearer ' + this.state.token
        }
      })
       .then(function(response) {
         return response.json()
       })
       .then(function(json) {
         if(json.error) {
           console.warn(json.error);
         }
         else {
           if(json.current_page !== json.last_page)
           {
              nextPage = nextPage + 1;
           }
           for(var i = 0; i < json.data.length; i++)
           {
             tags.push(json.data[i]);
           }
           this.setState({
             nextPage: nextPage,
             lastPage: json.last_page,
             currentPage: json.current_page,
             tags: tags,
             isLoading:false
           })
         }
       }.bind(this));
    }
  };

  showToast = (text) => {
    Toast.show({
     text: text,
     position: 'bottom',
     buttonText:'OK',
     duration:3000
    });
  };

  handleTag = (event) => {
    this.setState({
      tagName: event.nativeEvent.text
    })
  };

  searchTag(id, name) {
    this.setState({
      tagID: id,
      nextTopic:2,
      currentTopic:1,
      lastTopic:1,
      tagName:name
    }, function() {
      fetch('http://bragger.technopathic.me/api/searchTag?page=1&token=' + this.state.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' +this.state.token
        },
        body: JSON.stringify({
          id: id
        })
      }).then(function(response) {
          return response.json()
      })
      .then(function(json) {
        this.setState({
          topics: json.data
        })
      }.bind(this));
    });
  };

  removeTag = () => {
    this.setState({
      tagName:"",
      topics:[],
      nextPage:1,
      currentPage:0,
      lastPage:1,
      nextTopic:2,
      currentTopic:1,
      lastTopic:1
    })
  }

  searchTopics()
  {
    var nextTopic = this.state.nextTopic;
    var topics = this.state.topics;
    if(this.state.currentPage !== this.state.lastPage)
    {
      fetch('http://bragger.technopathic.me/api/searchTopics?page='+this.state.nextTopic+'&token=' + this.state.token, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.state.token
        },
        body: JSON.stringify({
          searchContent: this.state.tagName
        })
      }).then(function(response) {
          return response.json();
      })
      .then(function(json) {
        if(json.data.length === 0) {
          this.showToast('No Posts were Found.');
        }
        else if(json.current_page !== json.last_page)
        {
           nextTopic = nextTopic + 1;
        }
        for(var i = 0; i < json.data.length; i++)
        {
          topics.push(json.data[i]);
        }
        this.setState({
          nextTopic: nextTopic,
          lastTopic: json.last_page,
          currentTopic: json.current_page,
          topics: topics,
        })
      }.bind(this));
    }
  };

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
      <View style={cardStyle}>
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
      </View>
    )
  }

  render () {

    const iconStyle = {
      marginRight:10,
      color:'#999999'
    };

    const appBar = {
      backgroundColor:"#263238",
      justifyContent:'center',
      alignItems:'center',
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
      if(this.state.topics.length === 0)
      {
        return(
          <ScrollView style={styles.container}>
            <Header searchBar style={appBar} rounded>
              <Item>
                <Input selectionColor="#DF3D82" placeholder="Search" value={this.state.tagName} onChange={this.handleTag} style={{marginTop:5}} returnKeyType='search' onSubmitEditing={() => this.setState({
                    nextPage:1,
                    currentPage:0,
                    lastPage:1,
                    nextTopic:1,
                    currentTopic:1,
                    lastTopic:1,
                  }, function() {this.searchTopics()})}
                />
                <Icon name="search" color='#555555' onPress={() => this.setState({
                    nextPage:1,
                    currentPage:0,
                    lastPage:1,
                    nextTopic:1,
                    currentTopic:1,
                    lastTopic:1,
                  }, function() {this.searchTopics()})}
                />
              </Item>
            </Header>
            <List>
              {this.state.tags.map((tag, i) => (
                <ListItem key={tag.id} onPress={() => this.searchTag(tag.id, tag.tagName)}>
                  <Icon name="md-search" style={iconStyle}/>
                  <Text style={{fontSize:14, fontFamily:'Lato-Regular'}}>{tag.tagName}</Text>
                  <Right>
                    <Badge success>
                        <Text>{tag.tagCount}</Text>
                    </Badge>
                  </Right>
                </ListItem>
              ))}
            </List>
          </ScrollView>
        );
      }
      else {
        return(
          <Container>
            <Header searchBar style={appBar} rounded>
              <Item>
                <Input selectionColor="#DF3D82" placeholder="Search" value={this.state.tagName} onChange={this.handleTag} style={{marginTop:5}} returnKeyType='search'
                  onSubmitEditing={() => this.setState({
                    nextPage:1,
                    currentPage:0,
                    lastPage:1,
                    nextTopic:1,
                    currentTopic:1,
                    lastTopic:1,
                  }, function() {this.searchTopics()})}
                />
                <Icon name="close" color='#555555' onPress={() => this.removeTag()}/>
              </Item>
            </Header>
            <FlatList
              data={this.state.topics}
              keyExtractor={(topic, index) => index}
              renderItem={this.renderTopics}
              onEndReached={this.searchTopics}
              onEndReachedThreshold={1}
              disableVirtualization={false}
            />
          </Container>
        );
      }
    }
  }
}

export default Search
