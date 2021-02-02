import React,{useEffect, useRef, useState} from 'react';
import {useParams,useHistory} from 'react-router-dom';
import axios from '../../util/axiosInstance';

interface resetPasswordPageParam{
  code: string;
}
export function ResetPassword():JSX.Element{
  const history = useHistory();
  const params = useParams<resetPasswordPageParam>();
  const {code} = params;
  const pwdRef = useRef<null|HTMLInputElement>(null);
  const pwdConfirmRef = useRef<null|HTMLInputElement>(null);
  const [userId, setUserId] = useState<string>('');
  
  //8fddd73f8f2f13740f704e3f192382623bc2f4d2
  useEffect(() => {
    // code 로 유저id 조회
    // invalid code | user 없는 경우 -> redirect to login page
    axios.get(`http://localhost:4000/auth/code/${code}`)
    .then(res => {
      const {data} = res;
      setUserId(data.userId);
    })
    .catch(e => {
      console.error(e);
      history.push('/login');
    });
  },[])

  function checkPassword(){
    if (pwdRef.current && pwdConfirmRef.current){
      return pwdRef.current.value === pwdConfirmRef.current.value
    }
    return false;
  }

  function sendPassword(e:React.MouseEvent<HTMLButtonElement, MouseEvent>){
    e.preventDefault();
    const pass = checkPassword();
    if (!pass){
      alert('비밀번호가 서로 다릅니다');
    } else {
      if(pwdRef.current){
        axios.post('http://localhost:4000/auth/reset-password-by-email',{
          code,
          password: pwdRef.current.value
        }).then(res => {
          console.log(res);
          history.push('/login');
        }).catch(e => {
          console.error(e);
        })
      }
      
    }
  }
  return (
  <section>
    <h3>비밀번호 변경 페이지</h3>
    <form>
      <div>
        <label htmlFor="pwd">비밀번호: </label>
        <input name="pwd" type="password" ref={pwdRef}></input>
      </div>
      <div>
        <label htmlFor="pwdConfirm">비밀번호 확인</label>
        <input name="pwdConfirm" type="password" ref={pwdConfirmRef}></input>
      </div>
      <button type="submit" onClick={sendPassword}>입력</button>
    </form>
  </section>
  );
}