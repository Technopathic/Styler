// @flow

import React from 'react'
import { ScrollView, AsyncStorage, View, Image, Dimensions } from 'react-native'
import { Actions as NavigationActions } from 'react-native-router-flux'

import { Container, Header, Content, List, ListItem, Text, Button, Right, Left, Body, Tab, Tabs, Thumbnail, Toast, Spinner} from 'native-base'
import Icon from 'react-native-vector-icons/MaterialIcons';

// Styles
import Styles from './Styles/ProfileStyle'

class Notifications extends React.Component {
  constructor(props) {
   super(props);
   this.state = {
    user: "",
    token: "",
    notifs:[],
    requests:[],
    reports:[],
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
     this.getNotifs();
   })
 };

 getNotifs = () => {
  fetch('http://styler.technopathic.me/api/getNotifs?token=' + this.state.token, {
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

    }
    else {
      this.setState({
        notifs: json.notifications.data,
        requests: json.requests.data,
        reports:json.reports.data,
        isLoading:false
      })

    }
  }.bind(this));

  fetch('http://styler.technopathic.me/api/readNotifs?token=' + this.state.token, {
    headers:{
      'Authorization': 'Bearer ' + this.state.token
    }
  });
 };

  deleteNotif(id, index, type)
  {
    var _this = this;
    var notifs = this.state.notifs;
    var requests = this.state.requests;
    var reports = this.state.reports;

    fetch('http://styler.technopathic.me/api/deleteNotif/'+id+'?token=' + this.state.token, {
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
        if(json === 1)
        {
          if(type === "Notif")
          {
            notifs.splice(index, 1);
            _this.setState({
              notifs:notifs
            })
          }
          else if(type === "Request")
          {
            requests.splice(index, 1);
            _this.setState({
              requests:requests
            })
          }
          else if(type === "Report")
          {
            reports.splice(index, 1);
            _this.setState({
              reports:reports
            })
          }
        }
      }
    });
  };

  acceptRequest(id, peerID, index)
  {
    var _this = this;
    var requests = this.state.requests;
    fetch('http://styler.technopathic.me/api/acceptRequest/'+id+'/'+peerID+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
       return response.json()
     })
     .then(function(json) {
       if(json.error === "token_not_provided")
       {

       }
       else {
         _this.showToast('Request accepted.');
         requests.splice(index, 1);
         _this.setState({
           requests:requests
         })
       }
     }.bind(this));
  };

  denyRequest(id, peerID, index)
  {
    var _this = this;
    var requests = this.state.requests;
    fetch('http://styler.technopathic.me/api/denyRequest/'+id+'/'+peerID+'?token=' + this.state.token, {
      method: 'POST',
      headers:{
        'Authorization': 'Bearer ' + this.state.token
      }
    }).then(function(response) {
       return response.json()
     })
     .then(function(json) {
       if(json.error === "token_not_provided")
       {
       }
       else {
         _this.showToast('Request denied.');
         requests.splice(index, 1);
         _this.setState({
           requests:requests
         })
       }
     }.bind(this));
  };

  renderNotif(notif, index)
  {

    if(notif.notiType === "Reply")
    {
      return(
        <ListItem key={notif.id}>
          <Thumbnail source={{uri:notif.avatar}}  onPress={() => {NavigationActions.profile({uid:notif.peerID})}}/>
          <Body onPress={() => {NavigationActions.detail({id:topic.id})}}>
            <Text>{notif.name}</Text>
            <Text note>Has replied to your topic.</Text>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='close' size={20} style={{color:'#CCCCCC'}} onPress={() => this.deleteNotif(notif.id, index, "Notif")}/>
            </Button>
          </Right>
        </ListItem>
      );
    }
    else if(notif.notiType === "Bounce")
    {
      return(
        <ListItem key={notif.id}>
          <Thumbnail source={{uri:notif.avatar}} onPress={() => {NavigationActions.detail({id:topic.id})}}/>
          <Body onPress={() => {NavigationActions.detail({id:topic.id})}}>
            <Text>{notif.name}</Text>
            <Text note>Has replied to your reply.</Text>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='close' size={25} style={{color:'#CCCCCC'}} onPress={() => this.deleteNotif(notif.id, index, "Notif")}/>
            </Button>
          </Right>
        </ListItem>
      );
    }
    else if(notif.notiType === "Mention")
    {
      return(
        <ListItem key={notif.id}>
          <Thumbnail source={{uri:notif.avatar}} onPress={() => {NavigationActions.detail({id:topic.id})}}/>
          <Body onPress={() => {NavigationActions.detail({id:topic.id})}}>
            <Text>{notif.name}</Text>
            <Text note>Has mentioned you.</Text>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='close' size={25} style={{color:'#CCCCCC'}} onPress={() => this.deleteNotif(notif.id, index, "Notif")}/>
            </Button>
          </Right>
        </ListItem>
      );
    }
    else if(notif.notiType === "Vote")
    {
      return(
        <ListItem key={notif.id}>
          <Thumbnail source={{uri:notif.avatar}} onPress={() => {NavigationActions.detail({id:topic.id})}}/>
          <Body onPress={() => {NavigationActions.detail({id:topic.id})}}>
            <Text>{notif.name}</Text>
            <Text note>Liked your topic.</Text>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='close' size={25} style={{color:'#CCCCCC'}} onPress={() => this.deleteNotif(notif.id, index, "Notif")}/>
            </Button>
          </Right>
        </ListItem>
      );
    }
  };

  renderRequest(request, index)
  {

    if(request.notiType === "Follower")
    {
      return(
        <ListItem key={request.id}>
          <Thumbnail source={{uri:request.avatar}} onPress={() => {NavigationActions.profile({id:request.peerID})}}/>
          <Body onPress={() => {NavigationActions.profile({id:request.peerID})}}>
            <Text>{request.name}</Text>
            <Text note>Is now following you.</Text>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='close' size={25} style={{color:'#CCCCCC'}} onPress={() => this.deleteNotif(request.id, index, "Request")}/>
            </Button>
          </Right>
        </ListItem>
      );
    }
    else if(request.notiType === "Request")
    {
      return(
        <ListItem key={request.id}>
          <Thumbnail source={{uri:request.avatar}} onPress={() => {NavigationActions.profile({id:request.peerID})}}/>
          <Body onPress={() => {NavigationActions.profile({id:request.peerID})}}>
            <Text>{request.name}</Text>
            <Text note>Has sent you a request.</Text>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='check' size={25} style={{color:'#CCCCCC'}} onPress={() => this.acceptRequest(request.id, request.peerID, index)}/>
            </Button>
            <Button transparent>
              <Icon name='close' size={25} style={{color:'#CCCCCC'}} onPress={() => this.denyRequest(request.id, request.peerID, index)}/>
            </Button>
          </Right>
        </ListItem>
      );
    }
    else if(request.notiType === "Accept")
    {
      return(
        <ListItem key={request.id}>
          <Thumbnail source={{uri:request.avatar}} onPress={() => {NavigationActions.profile({id:request.peerID})}}/>
          <Body onPress={() => {NavigationActions.profile({id:request.peerID})}}>
            <Text>{request.name}</Text>
            <Text note>Has accepted your request.</Text>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='close' size={25} style={{color:'#CCCCCC'}} onPress={() => this.deleteNotif(request.id, index, "Request")}/>
            </Button>
          </Right>
        </ListItem>
      );
    }
  };

  renderReportList(report, index)
  {
    const ListStyle = {
      margin:"5px",
      borderRadius:"5px",
      background:"#EEEEEE"
    };

    const linkStyle = {
      textDecoration:"none",
      color:"#333333"
    };

    if(report.notiType === "Topic Report")
    {
      return(
        <ListItem key={report.id}>
          <Thumbnail source={{uri:report.avatar}} onPress={() => {NavigationActions.detail({id:report.topicID})}}/>
          <Body onPress={() => {NavigationActions.detail({id:report.topicID})}}>
            <Text>{report.name}</Text>
            <Text note>Has reported a topic.</Text>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='close' size={25} style={{color:'#CCCCCC'}} onPress={() => this.deleteNotif(report.id, index, "Report")}/>
            </Button>
          </Right>
        </ListItem>
      );
    }
    else if(report.notiType === "Reply Report")
    {
      return(
        <ListItem key={report.id}>
          <Thumbnail source={{uri:report.avatar}} onPress={() => {NavigationActions.detail({id:report.topicID})}}/>
          <Body onPress={() => {NavigationActions.detail({id:report.topicID})}}>
            <Text>{report.name}</Text>
            <Text note>Has reported a reply.</Text>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='close' size={25} style={{color:'#CCCCCC'}} onPress={() => this.deleteNotif(report.id, index, "Report")}/>
            </Button>
          </Right>
        </ListItem>
      );
    }
    else if(report.notiType === "Profile Report")
    {
      return(
        <ListItem key={report.id}>
          <Thumbnail source={{uri:report.avatar}} onPress={() => {NavigationActions.profile({id:report.topicID})}}/>
          <Body onPress={() => {NavigationActions.profile({id:report.topicID})}}>
            <Text>{report.name}</Text>
            <Text note>Has reported a profile.</Text>
          </Body>
          <Right>
            <Button transparent>
              <Icon name='close' size={25} style={{color:'#CCCCCC'}} onPress={() => this.deleteNotif(report.id, index, "Report")}/>
            </Button>
          </Right>
        </ListItem>
      );
    }
  }

  renderReport()
  {
    if(this.state.user.user.role === 1)
    {
      return (
        <Tab heading="Reports">
          {this.renderNoReports()}
          <List>
            {this.state.reports.map((report, index) => (
              this.renderReportList(report, index)
            ))}
          </List>
        </Tab>
      );
    }
  };

  renderNoNotif()
  {
    const noNotifs = {
      color:"#555555",
      fontSize:11,
      textAlign:"center",
      fontStyle:"italic",
      padding:15,
      flex:1,
      justifyContent:"center"
    }

    if(this.state.notifs.length === 0)
    {
      return(
        <Text style={noNotifs}>
          There are no notifications.
        </Text>
      );
    }
  };

  renderNoRequests()
  {
    const noNotifs = {
      color:"#555555",
      fontSize:11,
      textAlign:"center",
      fontStyle:"italic",
      padding:15,
      flex:1,
      justifyContent:"center"
    };

    if(this.state.requests.length === 0)
    {
      return(
        <Text style={noNotifs}>
          There are no requests.
        </Text>
      );
    }
  };

  renderNoReports()
  {
    const noNotifs = {
      color:"#555555",
      fontSize:11,
      textAlign:"center",
      fontStyle:"italic",
      padding:15,
      flex:1,
      justifyContent:"center"
    };

    if(this.state.reports.length === 0)
    {
      return(
        <Text style={noNotifs}>
          There are no reports.
        </Text>
      );
    }
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
      maxWidth:200,
      fontFamily:"Lobster-Regular"
    };

    const leftNav = {
      flex:1,
      flexDirection:'row'
    }

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
          <Header style={appBar} hasTabs>
            <Left style={leftNav}>
              <Button transparent onPress={() => NavigationActions.pop()}>
                <Icon name='chevron-left' size={35} style={{color:'#EEEEEE'}} />
              </Button>
            </Left>
            <Text style={titleStyle}>Notifications</Text>
            <Right></Right>
          </Header>
          <View>
            <Tabs>
              <Tab heading="New">
                {this.renderNoNotif()}
                <List>
                  {this.state.notifs.map((notif, index) => (
                    this.renderNotif(notif, index)
                  ))}
                </List>
              </Tab>
              <Tab heading="Follows">
                {this.renderNoRequests()}
                <List>
                  {this.state.requests.map((request, index) => (
                    this.renderRequest(request, index)
                  ))}
                </List>
              </Tab>
              {this.renderReport()}
            </Tabs>
          </View>


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

export default Notifications
