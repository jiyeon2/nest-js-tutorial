import { Button } from '@material-ui/core';
import axios from 'axios';
import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import KaKaoLogin from 'react-kakao-login';
import {useUserLoginDispatch} from '../../contexts/UserContext';

const token = "b951a66ca1bf15f3ac5a9c266d4a8af5";

// export interface ExtendedWindow extends Window {
//   Kakao: any;
// }
// declare let window : ExtendedWindow;

export function KakaoLogin():JSX.Element{
  const dispatch = useUserLoginDispatch();
  const history = useHistory();
  // const {Kakao} = window;

  const responseKaKao = (res:any) => {
    const param ={
      kakaoId: res.profile.id,
      username: res.profile.kakao_account.profile.nickname,
      email: res.profile.kakao_account.email
    }
    axios.post(
      'http://localhost:4000/auth/kakaoLogin',
      param
    ).then(response => {
      const userInfo = response.data;
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      dispatch({
        type: 'LOGIN',
        username: param.username,
        email: param.email,
        isLoggedIn: true,
        accessToken: userInfo.access_token
      })
      history.push('/todos');
    }).catch(e => {
      console.error(e);
    })
    
  }
  const responseFail = (err:any) => {
    console.error(err);
  }
  return (
    <section>
      <h3>kakao login</h3>
      <KaKaoLogin 
      useLoginForm
      token={token}
      onSuccess={responseKaKao}
      onFail={responseFail}
      onLogout={console.info}
      />
      

    </section>
  )
}