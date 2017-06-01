// @flow

import React from 'react'
import { ScrollView, AsyncStorage, View, Image, Dimensions, FlatList } from 'react-native'
import { Actions as NavigationActions } from 'react-native-router-flux'

import { Container, Content, Header, List, ListItem, Text, Button, Left, Right, Body, Thumbnail, Toast, Spinner } from 'native-base'
import Icon from 'react-native-vector-icons/MaterialIcons';

// Styles
import Styles from './Styles/ProfileStyle'

class Followings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      followings: [],
      token: "",
      nextPage:1,
      currentPage:0,
      lastPage:1,
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
     this.setState({
       token: value
     });
   })
   .then(() => {
     this.getFollowing();
   })
 };

 getFollowing = () => {
  var nextPage = this.state.nextPage;
  var followings = this.state.followings;
  if(this.state.currentPage !== this.state.lastPage)
  {
    fetch('http://styler.technopathic.me/api/getFollowing/'+this.props.id+'?page='+this.state.nextPage+'&token=' + this.state.token, {
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
         for(var i = 0; i < json.data.length; i++)
         {
           followings.push(json.data[i]);
         }
         this.setState({
           nextPage: nextPage,
           lastPage: json.last_page,
           currentPage: json.current_page,
           followings: followings,
         })
       }
     }.bind(this));
   }
  };

  storeFollow(id) {
    var _this = this;
    var followings = this.state.followings;
    fetch('http://styler.technopathic.me/api/storeFollower?token=' + this.state.token, {
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
          for(var i = 0; i < followings.length; i++)
          {
            if(followings[i].followerID === id)
            {
              followings[i].follow = 1;
              _this.setState({
                followings:followings
              });
            }
          }
        }
        else if(json === 4)
        {
          _this.showToast('A request has been sent.');
          for(var i = 0; i < followings.length; i++)
          {
            if(followings[i].followerID === id)
            {
              followings[i].follow = 2;
              _this.setState({
                followings:followings
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
          for(var i = 0; i < followings.length; i++)
          {
            if(followings[i].followerID === id)
            {
              followings[i].follow = 0;
              _this.setState({
                followings:followings
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
        <Button block style={followButton} onTouchTap={() => this.storeFollow(id)}><Text style={{fontFamily:'Lato-Regular'}}>Follow</Text></Button>
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


    if(this.state.followings.length === 0)
    {
      return(
        <Text style={noFollow}>
          Nobody is being followed here.
        </Text>
      );
    }
  }

  renderFollowings = (following) => {
    var following = following.item;

    return(
      <ListItem thumbnail key={following.id}>
        <Left>
          <Thumbnail source={{uri:following.avatar}} small/>
        </Left>
        <Body>
          <Text style={{fontSize:14, fontFamily:'Lato-Regular'}}>{following.profileName}</Text>
          <Text note style={{fontSize:12, fontFamily:'Montserrat-Regular'}}>@{following.name}</Text>
        </Body>
        <Right>
          {this.renderFollow(following.follow, following.userID)}
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
              <Text style={titleStyle}>Following</Text>
            </Body>
          </Header>
          <Content>
            {this.renderNoFollow()}
          </Content>
          <FlatList
            data={this.state.followings}
            keyExtractor={(follower, index) => index}
            renderItem={this.renderFollowings}
            onEndReached={this.getFollowing}
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

export default Followings
