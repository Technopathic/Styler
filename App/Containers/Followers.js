// @flow

import React from 'react'
import { ScrollView, AsyncStorage, View, Image, Dimensions, FlatList } from 'react-native'
import { Actions as NavigationActions } from 'react-native-router-flux'

import { Container, Content, Header, List, ListItem, Text, Button, Left, Right, Body, Thumbnail, Toast, Spinner} from 'native-base'
import Icon from 'react-native-vector-icons/MaterialIcons';

// Styles
import Styles from './Styles/ProfileStyle'

class Followers extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      followers: [],
      token: "",
      nextPage:1,
      currentPage:0,
      lastPage:1,
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
     this.setState({
       token: value
     });
   })
   .then(() => {
     this.getFollowers();
   })
 };

 getFollowers = () => {
    var nextPage = this.state.nextPage;
    var followers = this.state.followers;
    if(this.state.currentPage !== this.state.lastPage)
    {
      fetch('http://bragger.technopathic.me/api/getFollowers/'+this.props.id+'?page='+this.state.nextPage+'&token=' + this.state.token, {
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
           //this.context.router.push('signin');
         }
         else {
           if(json.current_page !== json.last_page)
           {
              nextPage = nextPage + 1;
           }
           for(var i = 0; i < json.data.length; i++)
           {
             followers.push(json.data[i]);
           }
           this.setState({
             nextPage: nextPage,
             lastPage: json.last_page,
             currentPage: json.current_page,
             followers: followers,
             isLoading:false
           })
         }
       }.bind(this));
    }
  };

  storeFollow(id) {
    var _this = this;
    var followers = this.state.followers;
    fetch('http://bragger.technopathic.me/api/storeFollower?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      },
      body: JSON.stringify({
        userID: id
      })
    }).then(function(response) {
        return response.json()
    }).then(function(json) {
      if(json.error)
      {

      }
      else {
        if(json === 0)
        {
          _this.showToast('Could not find user.');
        }
        else if(json === 3)
        {
          _this.showToast('You cannot follow yourself.');
        }
        else if(json === 1)
        {
          _this.showToast('Now following.');
          for(var i = 0; i < followers.length; i++)
          {
            if(followers[i].followerID === id)
            {
              followers[i].follow = 1;
              _this.setState({
                followers:followers
              });
            }
          }
        }
        else if(json === 4)
        {
          _this.showToast('A request has been sent.');
          for(var i = 0; i < followers.length; i++)
          {
            if(followers[i].followerID === id)
            {
              followers[i].follow = 2;
              _this.setState({
                followers:followers
              });
            }
          }
        }
        else if(json === 5)
        {
          _this.showToast('You were denied.');
        }
        else if(json === 2)
        {
          _this.showToast('Unfollowed.');
          for(var i = 0; i < followers.length; i++)
          {
            if(followers[i].followerID === id)
            {
              followers[i].follow = 0;
              _this.setState({
                followers:followers
              });
            }
          }
        }
      }
    })
  };

  renderFollow(follow, id)
  {

    const followButton = {
      flex:1,
      borderWidth:1,
      borderColor:'#CCCCCC',
      backgroundColor:'#FFFFFF',
      elevation:0,
    };

    const activeButton = {
      flex:1,
      borderWidth:1,
      borderColor:'#DDDDDD',
      backgroundColor:'#DF3D82',
      elevation:0
    };

    const buttonColor = {
      color:'#222222'
    };

    if(follow === 0)
    {
      return(
        <Button block style={followButton} onTouchTap={() => this.storeFollow(id)}><Text>Follow</Text></Button>
      );
    }
    else if(follow === 1)
    {
      return(
        <Button block style={activeButton} onPress={() => this.storeFollow(id)}><Text>Following</Text></Button>
      );
    }
    else if(follow === 2)
    {
      return(
        <Button block style={followButton} onPress={() => this.storeFollow(id)}><Text>Request Sent</Text></Button>
      );
    }
    else if(follow == 3)
    {
      return(
        <Button block style={followButton} disabled={true}><Text style={buttonColor}>Follow</Text></Button>
      );
    }
  };

  renderNoFollow() {
    const noFollow = {
      color:"#555555",
      fontSize:11,
      textAlign:"center",
      fontStyle:"italic",
      padding:15,
      flex:1,
      justifyContent:"center"
    }


    if(this.state.followers.length === 0)
    {
      return(
        <Text style={noFollow}>
          There are no followers.
        </Text>
      );
    }
  }

  renderFollowers = (follower) => {
    var follower = follower.item;

    return(
      <ListItem thumbnail key={follower.id}>
        <Left>
          <Thumbnail size={60} source={{uri:follower.avatar}} small/>
        </Left>
        <Body>
          <Text style={{fontSize:14, fontFamily:'Lato-Regular'}}>{follower.profileName}</Text>
          <Text note style={{fontSize:12, fontFamily:'Montserrat-Regular'}}>@{follower.name}</Text>
        </Body>
        <Right>
          {this.renderFollow(follower.follow, follower.followerID)}
        </Right>
      </ListItem>
    );
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
        <Container style={Styles.container}>
          <Header style={appBar}>
            <Left>
              <Button transparent onPress={() => NavigationActions.pop()}>
                <Icon name='chevron-left' size={35} style={{color:'#EEEEEE'}} />
              </Button>
            </Left>
            <Body>
              <Text style={titleStyle}>Followers</Text>
            </Body>
          </Header>
          <Content>
            {this.renderNoFollow()}
          </Content>
          <FlatList
            data={this.state.followers}
            keyExtractor={(follower, index) => index}
            renderItem={this.renderFollowers}
            onEndReached={this.getFollowers}
            onEndReachedThreshold={1}
            disableVirtualization={false}
          />
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

export default Followers
