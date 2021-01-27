import { Button } from '@material-ui/core';
import axios from 'axios';
import React, {useState} from 'react';
import {useHistory} from 'react-router-dom';
import KaKaoLogin from 'react-kakao-login';

const token = "b951a66ca1bf15f3ac5a9c266d4a8af5";

export interface ExtendedWindow extends Window {
  Kakao: any;
}
declare let window : ExtendedWindow;

export function KakaoLogin():JSX.Element{
  const history = useHistory();
  const {Kakao} = window;

  const kakaoLogout = () => {
    if (!Kakao.Auth.getAccessToken()){
      console.log('not logged in');
      return;
    }

    Kakao.Auth.logout(() => {
      console.log('logout ok', Kakao.Auth.getAccessToken())
      // localStorage.setItem('accessToken','');
    })
  }


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
      const {accessToken} = response.data;
      localStorage.setItem('accessToken', accessToken);
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
      {/* <Button variant="contained" onClick={kakaoLogout}>카카오 로그아웃</Button> */}
      

    </section>
  )
}