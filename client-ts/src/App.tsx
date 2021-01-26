import React from 'react';
import CssBaseLine from '@material-ui/core/CssBaseline';
import {BrowserRouter, Switch, Route, Link as RouterLink} from 'react-router-dom';
import {Container, AppBar, Link, Paper, Grid} from '@material-ui/core';
import {TodosPage} from './components/todos/TodosPage';


function App() {

  return (
    <Container>
      <CssBaseLine/>
      <div className="App">
        <BrowserRouter>
          <AppBar position="static">
            <Grid container justify="space-around">
              <Link color="secondary" component={RouterLink} to="/">home</Link>
              <Link color="secondary" component={RouterLink} to="/todos">todos</Link>
              <Link color="secondary" component={RouterLink} to="/login">login</Link>
              <Link color="secondary" component={RouterLink} to="/signup">signup</Link>
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
                login
              </Route>
              <Route path="/signup">
                signup
              </Route>
            </Switch>
          </Paper>
        
        </BrowserRouter>
      </div>
    </Container>
  );
}

export default App;
