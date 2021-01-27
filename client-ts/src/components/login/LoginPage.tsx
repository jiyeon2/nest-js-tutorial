import React, {useState} from 'react';
import {Grid, FormControl, InputLabel, IconButton, InputAdornment, OutlinedInput, FilledInput, Button} from '@material-ui/core';
import {Visibility, VisibilityOff} from '@material-ui/icons';
import {KakaoLogin} from './KakaoLogin';
import {useHistory} from 'react-router-dom';
import axios from 'axios';

interface State{
  id: string;
  password: string;
  showPassword: boolean;
}
export function LoginPage():JSX.Element{
  const history = useHistory();
  const [values, setValues] = useState<State>({
    id: 'ann',
    password: 'ann',
    showPassword: true,
  });

  const handleChange = (prop: keyof State) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({...values, [prop]: e.target.value});
  }

  const handleClickShowPassword = () => {
    setValues((prevValues) => ({ ...prevValues, showPassword: !prevValues.showPassword }));
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const login = () => {
    console.log('login button clicked')
    axios.post('http://localhost:4000/auth/login',{
      username: values.id,
      password: values.password
    }).then(res => {
      console.log(res.data);
      localStorage.setItem('accessToken', res.data.access_token);
      history.push('/todos');
    }).catch((error) => {
      console.error(error);
      alert(error);
    })
  }
  return (
    <Grid>
      <section>
      <h3>login</h3>
      <FormControl variant="outlined">
        <InputLabel htmlFor="login-input-id">id</InputLabel>
          <OutlinedInput
            id="login-input-id"
            value={values.id}
            onChange={handleChange('id')}
          />
        </FormControl>
      <FormControl variant="outlined">
          <InputLabel htmlFor="login-input-password">Password</InputLabel>
          <OutlinedInput
            id="login-input-password"
            type={values.showPassword ? 'text' : 'password'}
            value={values.password}
            onChange={handleChange('password')}
            endAdornment={
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                >
                  {values.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            }
            labelWidth={70}
          />
        </FormControl>
        <Button onClick={login} variant="contained">로그인</Button>
        </section>
        <KakaoLogin/>
    </Grid>

  );
}