import React from 'react';
import CssBaseLine from '@material-ui/core/CssBaseline';
import {BrowserRouter, Switch, Route, Link as RouterLink} from 'react-router-dom';
import {Container, AppBar, Link, Paper, Grid, Typography, Button} from '@material-ui/core';
import {TodosPage} from './components/todos/TodosPage';
import {LoginPage} from './components/login/LoginPage';
import {LoginUserContextProvider} from './contexts/UserContext';
import axios from 'axios';

function App() {
  function logout(){
    axios.post('http://localhost:4000/auth/logout')
    .then(res => {
      console.log(res);
      localStorage.setItem('accessToken','');
    })
    .catch(e => console.error(e));
  }

  return (
    <LoginUserContextProvider>
    <Container>
      <CssBaseLine/>
      <div className="App">
        <BrowserRouter>
          <AppBar position="static">
            <Grid container justify="space-around" alignItems="center">
              <Link color="secondary" component={RouterLink} to="/">home</Link>
              <Link color="secondary" component={RouterLink} to="/todos">todos</Link>
              <Link color="secondary" component={RouterLink} to="/login">login</Link>
              <Link color="secondary" component={RouterLink} to="/signup">signup</Link>
              <Typography>로그인 한 유저:</Typography>
              <Button onClick={logout}>logout</Button>
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
                signup
              </Route>
            </Switch>
          </Paper>
        
        </BrowserRouter>
      </div>
    </Container>
    </LoginUserContextProvider>
  );
}

export default App;
