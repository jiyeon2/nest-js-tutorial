import React, { useEffect } from 'react';
import CssBaseLine from '@material-ui/core/CssBaseline';
import {BrowserRouter, Switch, Route, Link as RouterLink} from 'react-router-dom';
import {Container, AppBar, Link, Paper, Grid, Typography, Button} from '@material-ui/core';
import {TodosPage} from './components/todos/TodosPage';
import {LoginPage} from './components/login/LoginPage';
import axios from 'axios';
import {useLoginUserState, useUserLoginDispatch} from './contexts/UserContext';
import { SignupPage } from './components/signup/SignupPage';

function App() {
  const {username, isLoggedIn} = useLoginUserState();
  const dispatch = useUserLoginDispatch();

  function logout(){
    axios.post('http://localhost:4000/auth/logout')
    .then(res => {
      console.log('로그아웃');
      localStorage.setItem('userInfo','');
      dispatch({type: 'LOGOUT'});
    })
    .catch(e => console.error(e));
  }

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo){
      const userInfoObj = JSON.parse(userInfo);
      dispatch({
        type:'LOGIN',
        isLoggedIn: true,
        username: userInfoObj.username,
        email: userInfoObj.email,
        accessToken: userInfoObj.access_token,
      })
    }
  },[])

  return (
    <Container>
      <CssBaseLine/>
      <div className="App">
        <BrowserRouter>
          <AppBar position="static">
            <Grid container justify="space-around" alignItems="center">
              <Link color="secondary" component={RouterLink} to="/">home</Link>
              <Link color="secondary" component={RouterLink} to="/todos">todos</Link>
              <Link color="secondary" component={RouterLink} to="/signup">signup</Link> 
              
              {isLoggedIn 
              ? <Button onClick={logout}>logout</Button>
              : <Link color="secondary" component={RouterLink} to="/login">login</Link>
              }
              <Typography>로그인 한 유저:{username}</Typography>
            </Grid>
          </AppBar>

          <Paper>
            <Switch>
              <Route exact path="/">
                home
              </Route>
              <Route path="/todos">
                <TodosPage />
              </Route>
              <Route path="/login">
                <LoginPage />
              </Route>
              <Route path="/signup">
                <SignupPage />
              </Route>
            </Switch>
          </Paper>
        
        </BrowserRouter>
      </div>
    </Container>
  );
}

export default App;
